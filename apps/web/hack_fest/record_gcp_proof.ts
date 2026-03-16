/**
 * Reveel AI — GCP Console Proof Recorder
 * 
 * Records a walkthrough of the Google Cloud Console showing:
 * - Cloud Run service (reveel-backend)
 * - Cloud Build history
 * - Cloud Run logs
 * 
 * This script uses your existing Chrome profile so you are already
 * logged into Google Cloud Console.
 * 
 * Usage:
 *   npx tsx hack_fest/record_gcp_proof.ts
 */

import { chromium } from "playwright";
import path from "path";
import fs from "fs";

const OUTPUT_DIR = path.join(__dirname);
const PROJECT_ID = "studio-592211117-913e5";

async function main() {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });

    // Try to use the user's Chrome profile for GCP auth
    const userDataDir = path.join(
        process.env.HOME || "/tmp",
        "Library/Application Support/Google/Chrome"
    );

    let browser;
    let context;
    let page;

    // Try connecting to user's Chrome profile first
    try {
        context = await chromium.launchPersistentContext(userDataDir, {
            headless: false,
            slowMo: 500,
            viewport: { width: 1920, height: 1080 },
            channel: "chrome",
            recordVideo: {
                dir: OUTPUT_DIR,
                size: { width: 1920, height: 1080 },
            },
        });
        page = context.pages()[0] || await context.newPage();
        console.log("✅ Using Chrome profile (already logged into GCP)");
    } catch (e) {
        console.log("⚠️ Could not use Chrome profile, launching clean browser");
        console.log("   You may need to sign in to GCP manually.");
        browser = await chromium.launch({ headless: false, slowMo: 500 });
        context = await browser.newContext({
            viewport: { width: 1920, height: 1080 },
            recordVideo: {
                dir: OUTPUT_DIR,
                size: { width: 1920, height: 1080 },
            },
        });
        page = await context.newPage();
    }

    try {
        // ============================================================
        // SCENE 1: Cloud Run Service Overview
        // ============================================================
        console.log("\n🔷 Scene 1: Cloud Run Service");
        await page.goto(
            `https://console.cloud.google.com/run/detail/us-central1/reveel-backend/revisions?project=${PROJECT_ID}`,
            { waitUntil: "domcontentloaded", timeout: 30000 }
        );
        await page.waitForTimeout(8000); // GCP console loads slowly
        await page.screenshot({ path: path.join(OUTPUT_DIR, "gcp_01_cloud_run_service.png") });
        console.log("  ✅ Cloud Run service screenshot saved");

        // ============================================================
        // SCENE 2: Cloud Run Metrics
        // ============================================================
        console.log("\n🔷 Scene 2: Cloud Run Metrics");
        await page.goto(
            `https://console.cloud.google.com/run/detail/us-central1/reveel-backend/metrics?project=${PROJECT_ID}`,
            { waitUntil: "domcontentloaded", timeout: 30000 }
        );
        await page.waitForTimeout(8000);
        await page.screenshot({ path: path.join(OUTPUT_DIR, "gcp_02_cloud_run_metrics.png") });
        console.log("  ✅ Cloud Run metrics screenshot saved");

        // ============================================================
        // SCENE 3: Cloud Run Logs
        // ============================================================
        console.log("\n🔷 Scene 3: Cloud Run Logs");
        await page.goto(
            `https://console.cloud.google.com/run/detail/us-central1/reveel-backend/logs?project=${PROJECT_ID}`,
            { waitUntil: "domcontentloaded", timeout: 30000 }
        );
        await page.waitForTimeout(8000);
        await page.screenshot({ path: path.join(OUTPUT_DIR, "gcp_03_cloud_run_logs.png") });
        console.log("  ✅ Cloud Run logs screenshot saved");

        // ============================================================
        // SCENE 4: Cloud Build History
        // ============================================================
        console.log("\n🔷 Scene 4: Cloud Build History");
        await page.goto(
            `https://console.cloud.google.com/cloud-build/builds?project=${PROJECT_ID}`,
            { waitUntil: "domcontentloaded", timeout: 30000 }
        );
        await page.waitForTimeout(8000);
        await page.screenshot({ path: path.join(OUTPUT_DIR, "gcp_04_cloud_build_history.png") });
        console.log("  ✅ Cloud Build history screenshot saved");

        // ============================================================
        // SCENE 5: Firebase Console
        // ============================================================
        console.log("\n🔷 Scene 5: Firebase Project");
        await page.goto(
            `https://console.firebase.google.com/project/${PROJECT_ID}/overview`,
            { waitUntil: "domcontentloaded", timeout: 30000 }
        );
        await page.waitForTimeout(8000);
        await page.screenshot({ path: path.join(OUTPUT_DIR, "gcp_05_firebase_console.png") });
        console.log("  ✅ Firebase console screenshot saved");

        // ============================================================
        // SCENE 6: Firestore Database
        // ============================================================
        console.log("\n🔷 Scene 6: Firestore Database");
        await page.goto(
            `https://console.firebase.google.com/project/${PROJECT_ID}/firestore`,
            { waitUntil: "domcontentloaded", timeout: 30000 }
        );
        await page.waitForTimeout(8000);
        await page.screenshot({ path: path.join(OUTPUT_DIR, "gcp_06_firestore.png") });
        console.log("  ✅ Firestore screenshot saved");

    } catch (err) {
        console.error("❌ Error:", err);
    }

    // Close context to save recording
    await context.close();
    if (browser) await browser.close();

    console.log("\n========================================");
    console.log("✅ GCP proof recording complete!");
    console.log("========================================\n");

    // List generated files
    const files = fs.readdirSync(OUTPUT_DIR).filter(f => 
        (f.startsWith("gcp_") && f.endsWith(".png")) || f.endsWith(".webm")
    );
    console.log("GCP Proof files:");
    files.forEach(f => {
        const size = fs.statSync(path.join(OUTPUT_DIR, f)).size;
        console.log(`  📄 ${f} (${(size / 1024).toFixed(0)} KB)`);
    });
}

main().catch(console.error);
