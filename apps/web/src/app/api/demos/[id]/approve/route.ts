import { NextResponse } from "next/server";
import { OrchestratorAgent } from "@/lib/agents/orchestrator";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const resolvedParams = await params;
        const id = resolvedParams.id;

        if (!id) {
            return NextResponse.json({ error: "Missing demo id" }, { status: 400 });
        }

        const body = await req.json();
        const { script } = body;

        if (!script) {
            return NextResponse.json({ error: "Missing approved script" }, { status: 400 });
        }

        const apiKey = process.env.GOOGLE_API_KEY;
        if (!apiKey || apiKey === "your_gemini_api_key") {
            return NextResponse.json(
                { error: "GOOGLE_API_KEY is not configured. Please set it in .env.local" },
                { status: 500 }
            );
        }

        // Run Phase 2 asynchronously
        const orchestrator = new OrchestratorAgent(apiKey);

        // Fire and forget
        orchestrator.resumeDemoPhase2(id, script).catch((err) => {
            console.error("[API /approve] Pipeline Phase 2 failed:", err);
        });

        return NextResponse.json({
            success: true,
            message: "Demo Voiceover & Assembly started",
            id,
        });
    } catch (error: any) {
        console.error("[API /approve] Error:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
