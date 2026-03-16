/**
 * Reveel AI — Voice Agent
 *
 * Generates text-to-speech voiceover audio from the narration script.
 * Uses Google Cloud TTS via the @google/genai SDK's Gemini model
 * to produce a natural-sounding narration.
 *
 * Fallback: If Cloud TTS is unavailable, creates a silent placeholder
 * so the pipeline can still assemble a video from screenshots.
 */

import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import * as googleTTS from "google-tts-api";
import type { PipelineState } from "./types";

const execAsync = promisify(exec);

/**
 * Language code mapping for Google Cloud TTS
 */
const LANGUAGE_MAP: Record<string, { code: string; voice: string }> = {
    English: { code: "en-US", voice: "en-US-Studio-O" },
    Spanish: { code: "es-ES", voice: "es-ES-Studio-C" },
    French: { code: "fr-FR", voice: "fr-FR-Studio-A" },
    German: { code: "de-DE", voice: "de-DE-Studio-B" },
};

export class VoiceAgent {
    async run(state: PipelineState): Promise<PipelineState> {
        const audioDir = path.join(state.workDir, "audio");
        fs.mkdirSync(audioDir, { recursive: true });

        const langConfig = LANGUAGE_MAP[state.request.language] || LANGUAGE_MAP["English"];

        if (!state.scriptSegments.length) {
            console.warn("[VoiceAgent] No script segments available, skipping TTS.");
            return state;
        }

        try {
            // Map our studio code to a simple Google Translate lang code (e.g. 'en-US' -> 'en')
            const ttsLang = langConfig.code.split("-")[0] || "en";

            // google-tts-api automatically splits text > 200 chars into multiple requests
            const results = await googleTTS.getAllAudioBase64(state.scriptText, {
                lang: ttsLang,
                slow: false,
                host: "https://translate.google.com",
                splitPunct: ",.?",
            });

            // Concatenate the decoded base64 parts into a single buffer
            const buffers = results.map((r: any) => Buffer.from(r.base64, "base64"));
            const finalBuffer = Buffer.concat(buffers);
            
            console.log(`[VoiceAgent] TTS returned ${results.length} chunks, total buffer size: ${finalBuffer.length} bytes`);
            
            const audioPath = path.join(audioDir, "full_narration.mp3");
            fs.writeFileSync(audioPath, finalBuffer);
            state.audioPath = audioPath;
            
            console.log(`[VoiceAgent] Audio file written: ${audioPath} (${fs.statSync(audioPath).size} bytes)`);

            // Get exact duration using ffprobe
            try {
                const { stdout } = await execAsync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${audioPath}"`);
                const durationSecs = parseFloat(stdout.trim());
                if (!isNaN(durationSecs)) {
                    state.audioDurationMs = Math.floor(durationSecs * 1000);
                } else {
                    state.audioDurationMs = state.scriptSegments.reduce((sum, s) => sum + s.durationSeconds * 1000, 0);
                }
            } catch (err) {
                console.warn("[VoiceAgent] ffprobe failed to get exact duration, using estimate.");
                state.audioDurationMs = state.scriptSegments.reduce((sum, s) => sum + s.durationSeconds * 1000, 0);
            }

            console.log(`[VoiceAgent] Generated full audio track, duration: ${state.audioDurationMs}ms`);
        } catch (err: any) {
            console.warn("[VoiceAgent] TTS unavailable, creating silent placeholder:", err.message);

            // Create a minimal silent WAV file as placeholder
            const silentPath = path.join(audioDir, "silent.wav");
            const estimatedDuration = state.scriptSegments.reduce((sum, s) => sum + s.durationSeconds, 0) || 60;
            createSilentWav(silentPath, estimatedDuration);
            state.audioPath = silentPath;
            state.audioDurationMs = estimatedDuration * 1000;
        }

        return state;
    }
}

/**
 * Creates a minimal WAV file with silence.
 */
function createSilentWav(filePath: string, durationSeconds: number) {
    const sampleRate = 22050;
    const numSamples = sampleRate * durationSeconds;
    const dataSize = numSamples * 2; // 16-bit mono
    const fileSize = 44 + dataSize;

    const buffer = Buffer.alloc(fileSize);

    // RIFF header
    buffer.write("RIFF", 0);
    buffer.writeUInt32LE(fileSize - 8, 4);
    buffer.write("WAVE", 8);

    // fmt chunk
    buffer.write("fmt ", 12);
    buffer.writeUInt32LE(16, 16);       // Chunk size
    buffer.writeUInt16LE(1, 20);        // PCM
    buffer.writeUInt16LE(1, 22);        // Mono
    buffer.writeUInt32LE(sampleRate, 24);
    buffer.writeUInt32LE(sampleRate * 2, 28); // Byte rate
    buffer.writeUInt16LE(2, 32);        // Block align
    buffer.writeUInt16LE(16, 34);       // Bits per sample

    // data chunk
    buffer.write("data", 36);
    buffer.writeUInt32LE(dataSize, 40);
    // Remaining bytes are already 0 (silence)

    fs.writeFileSync(filePath, buffer);
}
