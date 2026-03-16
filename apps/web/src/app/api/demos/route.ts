/**
 * Reveel AI — POST /api/demos
 *
 * Creates a new demo generation job:
 * 1. Validates the request
 * 2. Kicks off the TypeScript orchestrator pipeline in the background
 * 3. Returns immediately so the frontend can track progress via Firestore
 */

import { NextResponse } from "next/server";
import { OrchestratorAgent } from "@/lib/agents/orchestrator";
import type { DemoRequest } from "@/lib/agents/types";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { id, url, prompt, persona, language, resolution, voiceover, captions, userId, orgId } = body;

        if (!id || !url) {
            return NextResponse.json({ error: "Missing required fields: id and url" }, { status: 400 });
        }

        const apiKey = process.env.GOOGLE_API_KEY;
        if (!apiKey || apiKey === "your_gemini_api_key") {
            return NextResponse.json(
                { error: "GOOGLE_API_KEY is not configured. Please set it in .env.local" },
                { status: 500 }
            );
        }

        const authHeader = req.headers.get("authorization");
        if (!authHeader?.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const token = authHeader.split(" ")[1];

        let decodedToken;
        try {
            decodedToken = await adminAuth.verifyIdToken(token);
        } catch (error) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        const userDoc = await adminDb.collection("users").doc(decodedToken.uid).get();
        if (!userDoc.exists) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const userData = userDoc.data()!;
        const isAdmin = userData.role === "admin";
        
        let maxDuration: number | undefined = undefined;

        if (!isAdmin) {
            if (userData.status !== "approved") {
                return NextResponse.json({ error: "Your account is pending admin approval." }, { status: 403 });
            }
            if (userData.usage?.demosGenerated >= 1) {
                return NextResponse.json({ error: "Free tier limit reached. You can only generate 1 demo." }, { status: 403 });
            }
            maxDuration = 120; // 2 minute limit
        }

        const request: DemoRequest = {
            id,
            url,
            prompt: prompt || "",
            persona: persona || "New User",
            language: language || "English",
            resolution: resolution || "1080p",
            voiceover: voiceover ?? true,
            captions: captions ?? true,
            userId: decodedToken.uid,
            orgId: userData.orgId || "",
            maxDuration,
        };

        // Increment usage before starting
        await adminDb.collection("users").doc(decodedToken.uid).update({
            "usage.demosGenerated": (userData.usage?.demosGenerated || 0) + 1
        });

        // Run Phase 1 asynchronously (fire-and-forget)
        // The orchestrator updates Firestore directly so the frontend gets real-time updates
        const orchestrator = new OrchestratorAgent(apiKey);
        orchestrator.generateDemoPhase1(request).catch((err) => {
            console.error("[API /demos] Pipeline Phase 1 failed:", err);
        });

        return NextResponse.json({
            success: true,
            message: "Demo generation started",
            id: request.id,
        });
    } catch (error: any) {
        console.error("[API /demos] Error:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
