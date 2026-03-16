/**
 * Reveel AI — Shared Types for Agent Pipeline
 */

export interface DemoRequest {
    id: string;
    url: string;
    prompt: string;
    persona: string;         // "Product Manager" | "Sales Rep" | "New User" | "Developer"
    language: string;        // "English" | "Spanish" | etc.
    resolution: string;      // "720p" | "1080p" | "1440p" | "4K"
    voiceover: boolean;
    captions: boolean;
    userId: string;
    orgId?: string;
    maxDuration?: number; // Caps the duration of generated demo for limits
}

export type DemoStatus =
    | "queued"
    | "analyzing"
    | "capturing"
    | "scripting"
    | "awaiting_approval"
    | "voiceover"
    | "editing"
    | "uploading"
    | "done"
    | "error";

export interface DemoResult {
    id: string;
    status: DemoStatus;
    progress: number;           // 0-100
    videoUrl?: string;
    thumbnailUrl?: string;
    script?: string;
    duration?: number;          // seconds
    error?: string;
    title?: string;
}

export interface PipelineState {
    request: DemoRequest;
    result: DemoResult;

    // Inter-agent data
    analysis: SiteAnalysis | null;
    screenshots: string[];      // base64 or file paths
    recordingPath: string;
    scriptText: string;
    scriptSegments: ScriptSegment[];
    audioPath: string;
    audioDurationMs?: number;   // NEW: Exact duration of the generated voiceover
    finalVideoPath: string;

    // Working directory
    workDir: string;
}

export interface SiteAnalysis {
    productName: string;
    productType: string;
    demoTitle: string;
    demoDescription: string;
    navigationSteps: NavigationStep[];
    keyFeatures: string[];
    estimatedDurationSeconds: number;
    tone: "professional" | "casual" | "technical" | "enthusiastic";
}

export interface NavigationStep {
    stepNumber: number;
    action: "navigate" | "click" | "type" | "scroll" | "wait";
    target: string;
    description: string;
    emphasis: boolean;
    data?: string;
}

export interface ScriptSegment {
    stepNumber: number;
    narration: string;
    durationSeconds: number;
}
