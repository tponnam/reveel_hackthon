/**
 * Reveel AI — Video Assembly Agent
 *
 * Takes the Playwright screen recording (.webm) and the voiceover audio
 * and merges them into a final polished MP4 using FFmpeg.
 *
 * Discovers FFmpeg from:
 * 1. System PATH
 * 2. Playwright's bundled FFmpeg (ms-playwright cache)
 * 3. Falls back to using raw .webm recording as-is
 */

import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import os from "os";
import type { PipelineState } from "./types";

const execAsync = promisify(exec);

export class VideoAssemblyAgent {
    private ffmpegPath: string | null = null;

    async run(state: PipelineState): Promise<PipelineState> {
        const videoDir = path.join(state.workDir, "output");
        fs.mkdirSync(videoDir, { recursive: true });

        // If we have a Playwright recording, use it as the base video
        if (!state.recordingPath || !fs.existsSync(state.recordingPath)) {
            console.warn("[VideoAgent] No browser recording found, skipping assembly.");
            return state;
        }

        // Discover FFmpeg
        this.ffmpegPath = await this.findFFmpeg();

        if (this.ffmpegPath) {
            try {
                await this.mergeWithFFmpeg(state, videoDir);
            } catch (err: any) {
                console.warn("[VideoAgent] FFmpeg merge failed:", err.message);
                // Fallback to raw recording
                state.finalVideoPath = state.recordingPath;
                state.result.videoUrl = state.recordingPath;
            }
        } else {
            console.warn("[VideoAgent] FFmpeg not found anywhere, using raw Playwright .webm recording.");
            state.finalVideoPath = state.recordingPath;
            state.result.videoUrl = state.recordingPath;
        }

        return state;
    }

    /**
     * Discover FFmpeg binary — checks system PATH first, then Playwright's bundled copy.
     */
    private async findFFmpeg(): Promise<string | null> {
        // 1. Try system PATH
        try {
            await execAsync("ffmpeg -version");
            console.log("[VideoAgent] Using system FFmpeg.");
            return "ffmpeg";
        } catch {
            // Not in PATH
        }

        // 2. Check Playwright's bundled FFmpeg
        const playwrightCacheDir = path.join(
            os.homedir(),
            "Library",
            "Caches",
            "ms-playwright"
        );

        if (fs.existsSync(playwrightCacheDir)) {
            const entries = fs.readdirSync(playwrightCacheDir).filter(e => e.startsWith("ffmpeg-"));
            for (const entry of entries) {
                const candidates = [
                    path.join(playwrightCacheDir, entry, "ffmpeg-mac"),      // macOS ARM/Intel
                    path.join(playwrightCacheDir, entry, "ffmpeg-linux"),    // Linux
                    path.join(playwrightCacheDir, entry, "ffmpeg.exe"),      // Windows
                ];
                for (const candidate of candidates) {
                    if (fs.existsSync(candidate)) {
                        console.log(`[VideoAgent] Using Playwright FFmpeg: ${candidate}`);
                        return candidate;
                    }
                }
            }
        }

        // 3. Check common Homebrew paths
        const brewPaths = ["/opt/homebrew/bin/ffmpeg", "/usr/local/bin/ffmpeg"];
        for (const p of brewPaths) {
            if (fs.existsSync(p)) {
                console.log(`[VideoAgent] Using Homebrew FFmpeg: ${p}`);
                return p;
            }
        }

        return null;
    }

    /**
     * Merge the Playwright screen recording with voiceover audio using FFmpeg.
     * Converts WebM → MP4 and overlays the audio track.
     */
    private async mergeWithFFmpeg(state: PipelineState, videoDir: string): Promise<void> {
        const outputPath = path.join(videoDir, "demo.mp4");
        const hasAudio = state.audioPath && fs.existsSync(state.audioPath);
        const ffmpeg = this.ffmpegPath || "ffmpeg";

        // Log file sizes for diagnostics
        console.log(`[VideoAgent] Recording file: ${state.recordingPath} (${fs.statSync(state.recordingPath).size} bytes)`);
        if (hasAudio) {
            console.log(`[VideoAgent] Audio file: ${state.audioPath} (${fs.statSync(state.audioPath!).size} bytes)`);
        } else {
            console.log(`[VideoAgent] No audio file found at: ${state.audioPath}`);
        }

        let cmd: string;

        if (hasAudio) {
            // Step 1: Normalize the concatenated MP3 chunks into a clean AAC file
            // The google-tts-api concatenates raw MP3 buffers which can have header issues
            const normalizedAudio = path.join(videoDir, "normalized_audio.aac");
            const normalizeCmd = [
                `"${ffmpeg}" -y`,
                `-i "${state.audioPath}"`,
                "-c:a aac -b:a 192k -ac 2 -ar 44100",
                `"${normalizedAudio}"`,
            ].join(" ");

            console.log("[VideoAgent] Normalizing audio:", normalizeCmd);
            try {
                await execAsync(normalizeCmd, { timeout: 60000 });
                console.log(`[VideoAgent] Normalized audio: ${normalizedAudio} (${fs.existsSync(normalizedAudio) ? fs.statSync(normalizedAudio).size : 0} bytes)`);
            } catch (normErr: any) {
                console.error("[VideoAgent] Audio normalization failed:", normErr.message);
                // Fall through to try direct merge
            }

            // Step 2: Merge normalized audio with video
            const audioToUse = fs.existsSync(normalizedAudio) ? normalizedAudio : state.audioPath!;
            cmd = [
                `"${ffmpeg}" -y`,
                `-i "${state.recordingPath}"`,
                `-i "${audioToUse}"`,
                "-c:v libx264 -preset fast -crf 23",
                "-c:a aac -b:a 192k",
                "-map 0:v:0 -map 1:a:0",
                "-shortest",
                "-movflags +faststart",
                `"${outputPath}"`,
            ].join(" ");
        } else {
            // Just convert WebM → MP4 (no audio)
            cmd = [
                `"${ffmpeg}" -y`,
                `-i "${state.recordingPath}"`,
                "-c:v libx264 -preset fast -crf 23",
                "-an",
                "-movflags +faststart",
                `"${outputPath}"`,
            ].join(" ");
        }

        console.log("[VideoAgent] Running FFmpeg merge:", cmd);
        try {
            const { stdout, stderr } = await execAsync(cmd, { timeout: 180000 });
            console.log("[VideoAgent] FFmpeg stdout:", stdout);
            if (stderr) console.log("[VideoAgent] FFmpeg stderr (last 500):", stderr.slice(-500));
        } catch (err: any) {
            console.error("[VideoAgent] FFmpeg execution failed:", err.message);
            console.error("[VideoAgent] FFmpeg stderr details:", err.stderr?.slice(-500));
            throw err;
        }

        if (fs.existsSync(outputPath)) {
            const outputSize = fs.statSync(outputPath).size;
            console.log(`[VideoAgent] Final video: ${outputPath} (${outputSize} bytes)`);
            state.finalVideoPath = outputPath;
            state.result.videoUrl = outputPath;
        } else {
            // Fallback to raw recording
            console.warn("[VideoAgent] Output file not created, falling back to raw recording.");
            state.finalVideoPath = state.recordingPath;
            state.result.videoUrl = state.recordingPath;
        }
    }
}
