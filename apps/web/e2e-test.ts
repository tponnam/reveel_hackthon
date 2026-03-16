/**
 * End-to-end pipeline test — loads .env.local, runs the full orchestrator,
 * and writes all logs to /tmp/e2e-test-output.log
 */
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

// Load env vars from .env.local
dotenv.config({ path: path.resolve(__dirname, ".env.local") });

const LOG_FILE = "/tmp/e2e-test-output.log";
function log(msg: string) {
    const line = `[${new Date().toISOString()}] ${msg}`;
    console.log(line);
    fs.appendFileSync(LOG_FILE, line + "\n");
}

// Clear old log
fs.writeFileSync(LOG_FILE, "");

async function main() {
    log("=== E2E Pipeline Test Starting ===");
    log(`GOOGLE_API_KEY: ${process.env.GOOGLE_API_KEY?.slice(0, 8)}...`);
    log(`STORAGE_BUCKET: ${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}`);
    log(`TEMP_DIR: ${process.env.TEMP_DIR || "/tmp/demoforge"}`);

    // Dynamic import to load TS modules
    const { OrchestratorAgent } = await import("./src/lib/agents/orchestrator");

    const apiKey = process.env.GOOGLE_API_KEY!;
    const agent = new OrchestratorAgent(apiKey);

    // Override updateFirestore to log instead of writing to Firestore
    (agent as any).updateFirestore = async (state: any) => {
        log(`[Firestore Mock] Status: ${state.result.status}, Progress: ${state.result.progress}%`);
    };

    const demoId = "e2e-test-" + Date.now();
    log(`Demo ID: ${demoId}`);

    const request = {
        id: demoId,
        url: "https://example.com",
        prompt: "Show the homepage of this simple website",
        persona: "New User",
        language: "English",
        resolution: "720p",
        voiceover: true,
        captions: false,
        userId: "test-user",
        orgId: "test-org",
    };

    try {
        const result = await agent.generateDemoPhase1(request);
        log("=== Pipeline Phase 1 Complete ===");
        log(`Status: ${result.status}`);
        log(`Video URL: ${result.videoUrl || "NONE"}`);
        log(`Thumbnail: ${result.thumbnailUrl || "NONE"}`);
        console.log(`[Firestore Mock] Title: ${result.title}`);
        console.log(`[Firestore Mock] Script: ${(result.script || "").slice(0, 200)}...`);
        console.log(`[Firestore Mock] Error: ${result.error || "NONE"}`);

        if (result.status === "awaiting_approval") {
            log(`\n=== Pipeline Phase 2 Starting (Auto-Approve) ===`);
            const finalState = await agent.resumeDemoPhase2(demoId, result.script || "");
            log(`\n=== Pipeline Full Complete ===`);
            log(`[Firestore Mock] Final Status: ${finalState.status}`);
            log(`[Firestore Mock] Final Video URL: ${finalState.videoUrl || "NONE"}`);
            log(`[Firestore Mock] Final Error: ${finalState.error || "NONE"}`);
        }

        // Check if video file exists
        if (result.videoUrl) {
            if (result.videoUrl.startsWith("http")) {
                log(`Video is a URL (cloud or local API): ${result.videoUrl}`);
            } else if (fs.existsSync(result.videoUrl)) {
                const stat = fs.statSync(result.videoUrl);
                log(`Video file exists! Size: ${(stat.size / 1024 / 1024).toFixed(2)} MB`);
            } else {
                log(`Video file NOT found at: ${result.videoUrl}`);
            }
        }
    } catch (err: any) {
        log(`Pipeline CRASHED: ${err.message}`);
        log(err.stack);
    }

    log("=== Test Complete. Log file: /tmp/e2e-test-output.log ===");
}

main();
