/**
 * Reveel AI — Orchestrator Agent
 *
 * The master coordinator that runs the full demo generation pipeline:
 * 1. Analyze URL with Gemini
 * 2. Capture browser screenshots with Playwright
 * 3. Generate narration script with Gemini
 * 4. Generate voiceover with Google Cloud TTS
 * 5. Assemble video with FFmpeg
 *
 * Uses Google AI SDK (@google/genai) for all LLM tasks.
 */

import { GoogleGenAI } from "@google/genai";
import path from "path";
import fs from "fs";
import type {
    DemoRequest,
    DemoResult,
    PipelineState,
    SiteAnalysis,
    DemoStatus,
} from "./types";
import { BrowserCaptureAgent } from "./browser-agent";
import { ScriptWriterAgent } from "./script-agent";
import { VoiceAgent } from "./voice-agent";
import { VideoAssemblyAgent } from "./video-agent";
import { StorageAgent } from "./storage-agent";

// Firebase Admin for server-side Firestore updates
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp, getApps, cert } from "firebase-admin/app";

// Initialize Firebase Admin (server-side only)
function getAdminDb() {
    if (getApps().length === 0) {
        initializeApp({
            projectId: process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        });
    }
    return getFirestore();
}

export class OrchestratorAgent {
    private ai: GoogleGenAI;
    private browserAgent: BrowserCaptureAgent;
    private scriptAgent: ScriptWriterAgent;
    private voiceAgent: VoiceAgent;
    private videoAgent: VideoAssemblyAgent;
    private storageAgent: StorageAgent;
    private apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
        this.ai = new GoogleGenAI({ apiKey });
        this.browserAgent = new BrowserCaptureAgent();
        this.scriptAgent = new ScriptWriterAgent(apiKey);
        this.voiceAgent = new VoiceAgent();
        this.videoAgent = new VideoAssemblyAgent();
        this.storageAgent = new StorageAgent();
    }

    async generateDemoPhase1(request: DemoRequest): Promise<DemoResult> {
        const workDir = path.join(
            process.env.TEMP_DIR || "/tmp/reveel",
            request.id
        );
        fs.mkdirSync(workDir, { recursive: true });

        const state: PipelineState = {
            request,
            result: {
                id: request.id,
                status: "queued",
                progress: 0,
            },
            analysis: null,
            screenshots: [],
            recordingPath: "",
            scriptText: "",
            scriptSegments: [],
            audioPath: "",
            finalVideoPath: "",
            workDir,
        };

        try {
            // Step 1: Analyze URL
            await this.updateStatus(state, "analyzing", 10);
            state.analysis = await this.analyzeUrl(state);

            // Step 2: Browser capture (Thumbnail only for Phase 1)
            await this.updateStatus(state, "capturing", 30);
            await this.browserAgent.captureThumbnail(state);

            // Step 3: Generate script
            await this.updateStatus(state, "scripting", 55);
            await this.scriptAgent.run(state);

            // Save script and title to result so UI can display them
            state.result.script = state.scriptText;
            state.result.title = state.analysis?.demoTitle || "Reveel Demo";
            state.result.duration = state.analysis?.estimatedDurationSeconds || 60;

            if (!state.result.thumbnailUrl && state.screenshots.length > 0) {
                // Temporary thumbnail for UI while waiting
                state.result.thumbnailUrl = state.screenshots[0];
            }

            // Save pipeline state to disk
            const statePath = path.join(state.workDir, "pipeline_state.json");
            fs.writeFileSync(statePath, JSON.stringify(state, null, 2));

            // Pause for approval
            await this.updateStatus(state, "awaiting_approval", 60);
        } catch (err: any) {
            console.error("[Orchestrator] Phase 1 error:", err);
            state.result.status = "error";
            state.result.error = err.message;
            await this.updateFirestore(state);
        }

        return state.result;
    }

    async resumeDemoPhase2(demoId: string, approvedScript: string): Promise<DemoResult> {
        const workDir = path.join(
            process.env.TEMP_DIR || "/tmp/reveel",
            demoId
        );
        const statePath = path.join(workDir, "pipeline_state.json");

        if (!fs.existsSync(statePath)) {
            console.error(`[Orchestrator] Pipeline state missing for ${demoId}`);
            const errState: PipelineState = {
                request: { id: demoId } as DemoRequest,
                result: { id: demoId, status: "error", progress: 0, error: "Pipeline state not found" },
            } as any;
            await this.updateFirestore(errState);
            return errState.result;
        }

        const state: PipelineState = JSON.parse(fs.readFileSync(statePath, "utf-8"));

        try {
            // Re-initialize state class instances if any were lost in serialization
            // (Currently our state is just plain objects/strings, so it's safe)

            // Apply the user's approved script
            state.scriptText = approvedScript;
            state.result.script = approvedScript;

            // Recalculate basic segments based on paragraphs since user might have added/removed some
            const paragraphs = approvedScript.split('\n\n').filter((p: string) => p.trim());
            state.scriptSegments = paragraphs.map((p: string, i: number) => ({
                stepNumber: i + 1,
                narration: p,
                // roughly estimate duration based on word count (150 words per min = 2.5 per sec)
                durationSeconds: Math.ceil(p.split(' ').length / 2.5)
            }));

            // Step 4: Generate voiceover
            await this.updateStatus(state, "voiceover", 70);
            await this.voiceAgent.run(state);

            // Step 4.5: Browser capture (Now accurately paced using generated audio duration)
            await this.updateStatus(state, "capturing", 80);
            await this.browserAgent.run(state);

            // Step 5: Assemble video
            await this.updateStatus(state, "editing", 90);
            await this.videoAgent.run(state);

            // Step 6: Upload to Cloud Storage (or set local serving URLs)
            await this.updateStatus(state, "editing" as DemoStatus, 95);
            await this.storageAgent.run(state);

            // Done!
            state.result.status = "done";
            state.result.progress = 100;

            if (!state.result.thumbnailUrl && state.screenshots.length > 0) {
                state.result.thumbnailUrl = state.screenshots[0];
            }

            await this.updateFirestore(state);

            // Cleanup
            const isCloudUrl = state.result.videoUrl?.startsWith("https://");
            if (isCloudUrl) {
                try {
                    fs.rmSync(state.workDir, { recursive: true, force: true });
                    console.log(`[Orchestrator] Cleaned up working directory: ${state.workDir}`);
                } catch (cleanupErr: any) {
                    console.warn(`[Orchestrator] Failed to cleanup ${state.workDir}:`, cleanupErr.message);
                }
            } else {
                console.log(`[Orchestrator] Keeping local files for API serving: ${state.workDir}`);
            }
        } catch (err: any) {
            console.error("[Orchestrator] Phase 2 error:", err);
            state.result.status = "error";
            state.result.error = err.message;
            await this.updateFirestore(state);
        }

        return state.result;
    }

    private async analyzeUrl(state: PipelineState): Promise<SiteAnalysis> {
        const prompt = `You are a demo video planning agent. Analyze the following and produce a structured plan.

URL: ${state.request.url}
User Prompt: ${state.request.prompt || "Show the main features of this product"}
Persona: ${state.request.persona}
Language: ${state.request.language}
${state.request.maxDuration ? `CRITICAL CONSTRAINT: The total estimated duration MUST NOT exceed ${state.request.maxDuration} seconds.` : ""}

Produce a JSON response with:
            {
                "productName": "Name of the product/app",
                    "productType": "Type (SaaS, e-commerce, portfolio, etc.)",
                        "demoTitle": "A compelling title for the demo",
                            "demoDescription": "A 1-2 sentence description",
                                "navigationSteps": [
                                    {
                                        "stepNumber": 1,
                                        "action": "navigate|click|type|scroll|wait",
                                        "target": "EXACT TEXT VISIBLE ON SCREEN or VALID CSS SELECTOR",
                                        "description": "What this step demonstrates",
                                        "emphasis": true,
                                        "data": ""
                                    }
                                ],
                                    "keyFeatures": ["list of features to highlight"],
                                        "estimatedDurationSeconds": 60,
                                            "tone": "professional"
            }

Plan 5 - 10 navigation steps that showcase the product effectively.
Return ONLY the JSON object, no markdown fences.`;

        try {
            const response = await this.ai.models.generateContent({
                model: "gemini-2.0-flash",
                contents: prompt,
            });

            let text = response.text ?? "";
            text = text.trim();
            if (text.startsWith("```")) {
                text = text.replace(/^```(?:json)?\n?/, "").replace(/```$/, "").trim();
            }

            const result = JSON.parse(text) as SiteAnalysis;
            
            // Enforce max duration hard cap
            if (state.request.maxDuration && result.estimatedDurationSeconds > state.request.maxDuration) {
                result.estimatedDurationSeconds = state.request.maxDuration;
            }
            
            return result;
        } catch (err: any) {
            console.warn("[Orchestrator] Analysis fallback:", err.message);
            return {
                productName: "Product Demo",
                productType: "web application",
                demoTitle: `Demo of ${state.request.url}`,
                demoDescription: state.request.prompt || "Product demonstration",
                navigationSteps: [
                    {
                        stepNumber: 1,
                        action: "navigate",
                        target: state.request.url,
                        description: "Navigate to the homepage",
                        emphasis: true,
                    },
                    {
                        stepNumber: 2,
                        action: "scroll",
                        target: "",
                        description: "Scroll to explore features",
                        emphasis: false,
                    },
                ],
                keyFeatures: [],
                estimatedDurationSeconds: 60,
                tone: "professional",
            };
        }
    }

    private async updateStatus(state: PipelineState, status: DemoStatus, progress: number) {
        state.result.status = status;
        state.result.progress = progress;
        await this.updateFirestore(state);
    }

    private async updateFirestore(state: PipelineState) {
        try {
            const db = getAdminDb();
            await db.collection("demos").doc(state.request.id).update({
                status: state.result.status,
                progress: state.result.progress,
                ...(state.result.title && { title: state.result.title }),
                ...(state.result.script && { script: state.result.script }),
                ...(state.result.error && { error: state.result.error }),
                ...(state.result.status === "done" && {
                    videoUrl: state.result.videoUrl || "",
                    thumbnailUrl: state.result.thumbnailUrl || "",
                    duration: state.result.duration || 0,
                }),
            });
        } catch (err: any) {
            console.warn("[Orchestrator] Firestore update failed:", err.message);
        }
    }
}
