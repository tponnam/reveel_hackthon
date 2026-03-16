/**
 * Reveel AI — Script Writer Agent
 *
 * Uses the Google AI SDK (@google/genai) with Gemini to generate
 * professional narration scripts from the site analysis.
 */

import { GoogleGenAI } from "@google/genai";
import type { PipelineState, ScriptSegment } from "./types";

export class ScriptWriterAgent {
    private ai: GoogleGenAI;

    constructor(apiKey: string) {
        this.ai = new GoogleGenAI({ apiKey });
    }

    async run(state: PipelineState): Promise<PipelineState> {
        const analysis = state.analysis;
        if (!analysis) {
            state.scriptText = "Welcome to our product demo.";
            state.scriptSegments = [{ stepNumber: 0, narration: state.scriptText, durationSeconds: 5 }];
            return state;
        }

        const prompt = `You are a professional video narrator writing a script for a SaaS product demo video.

Product: ${analysis.productName} (${analysis.productType})
Demo Title: ${analysis.demoTitle}
Target Persona: ${state.request.persona}
Tone: ${analysis.tone}
Language: ${state.request.language}

The demo has ${analysis.navigationSteps.length} steps:
${analysis.navigationSteps.map((s) => `${s.stepNumber}. ${s.description}`).join("\n")}

Key features to highlight: ${analysis.keyFeatures.join(", ")}

Write a narration script as a JSON array of segments:
[
  {
    "stepNumber": 0,
    "narration": "Opening line welcoming the viewer...",
    "durationSeconds": 5
  },
  ...
]

Rules:
- Keep each segment 2-4 sentences
- Use a ${analysis.tone} tone
- Highlight the value proposition
- End with a clear call-to-action
- Total script should be about ${analysis.estimatedDurationSeconds} seconds
- Return ONLY the JSON array, no markdown fences`;

        try {
            console.log(`[ScriptAgent] Generating script with gemini-2.0-flash for ${analysis.productName}...`);
            const response = await this.ai.models.generateContent({
                model: "gemini-2.0-flash",
                contents: prompt,
            });

            const text = response.text ?? "";
            console.log(`[ScriptAgent] Raw response (${text.length} chars): ${text.substring(0, 200)}...`);
            let cleaned = text.trim();

            // Strip markdown code fences if present
            if (cleaned.startsWith("```")) {
                cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/```$/, "").trim();
            }

            const segments: ScriptSegment[] = JSON.parse(cleaned);
            state.scriptSegments = segments;
            state.scriptText = segments.map((s) => s.narration).join("\n\n");
            console.log(`[ScriptAgent] Successfully parsed ${segments.length} segments, total script: ${state.scriptText.length} chars`);
        } catch (err: any) {
            console.error("[ScriptAgent] Error generating script:", err.message, err.stack?.substring(0, 300));
            // Richer fallback script
            const steps = analysis.navigationSteps.map(s => s.description).join(". ");
            state.scriptText = `Welcome to ${analysis.productName}. In this demo, we will walk you through ${analysis.demoDescription}. ${steps}. We hope this gives you a clear picture of what ${analysis.productName} has to offer. Try it today!`;
            state.scriptSegments = [
                { stepNumber: 0, narration: state.scriptText, durationSeconds: 15 },
            ];
        }

        return state;
    }
}
