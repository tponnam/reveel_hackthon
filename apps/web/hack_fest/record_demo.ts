/**
 * Reveel AI — Live App Demo Recorder
 * 
 * Records a complete walkthrough of the Reveel AI application
 * for hackathon submission proof. Captures:
 * - Landing page
 * - Sign-in flow
 * - Dashboard
 * - Demo generation (Phase 1)
 * - Script review
 * - Demo library with generated videos
 * 
 * Usage:
 *   npx tsx hack_fest/record_demo.ts
 */

import { chromium } from "playwright";
import path from "path";
import fs from "fs";

const OUTPUT_DIR = path.join(__dirname);
const APP_URL = "https://studio-592211117-913e5.web.app";

async function main() {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });

    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 300,
    });

    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
        recordVideo: {
            dir: OUTPUT_DIR,
            size: { width: 1920, height: 1080 },
        },
    });

    const page = await context.newPage();

    try {
        // ============================================================
        // SCENE 1: Landing Page (5s)
        // ============================================================
        console.log("🎬 Scene 1: Landing Page");
        await page.goto(APP_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
        await page.waitForTimeout(3000);
        await page.screenshot({ path: path.join(OUTPUT_DIR, "demo_01_landing.png") });
        console.log("  ✅ Landing page captured");

        // ============================================================
        // SCENE 2: Sign In
        // ============================================================
        console.log("🎬 Scene 2: Sign In");
        await page.goto(`${APP_URL}/auth/signin`, { waitUntil: "domcontentloaded", timeout: 30000 });
        await page.waitForTimeout(2000);

        // Fill email
        try {
            const emailInput = page.locator('input[type="email"]');
            await emailInput.waitFor({ state: "visible", timeout: 5000 });
            await emailInput.click();
            await emailInput.type("livetest@reveel.ai", { delay: 80 });
            await page.waitForTimeout(500);

            // Fill password
            const passwordInput = page.locator('input[type="password"]');
            await passwordInput.click();
            await passwordInput.type("Test123!", { delay: 80 });
            await page.waitForTimeout(500);

            await page.screenshot({ path: path.join(OUTPUT_DIR, "demo_02_signin.png") });
            console.log("  ✅ Sign in form filled");

            // Submit
            await page.click('button[type="submit"]');
            await page.waitForTimeout(3000);
        } catch (e) {
            console.log("  ⚠️ Sign-in form not found, may already be logged in");
        }

        // ============================================================
        // SCENE 3: Dashboard
        // ============================================================
        console.log("🎬 Scene 3: Dashboard");
        await page.goto(`${APP_URL}/dashboard`, { waitUntil: "domcontentloaded", timeout: 30000 });
        await page.waitForTimeout(3000);
        await page.screenshot({ path: path.join(OUTPUT_DIR, "demo_03_dashboard.png") });
        console.log("  ✅ Dashboard captured");

        // ============================================================
        // SCENE 4: Generate Page
        // ============================================================
        console.log("🎬 Scene 4: Generate Page");
        await page.goto(`${APP_URL}/dashboard/generate`, { waitUntil: "domcontentloaded", timeout: 30000 });
        await page.waitForTimeout(3000);
        await page.screenshot({ path: path.join(OUTPUT_DIR, "demo_04_generate.png") });
        console.log("  ✅ Generate page captured");

        // Fill in demo generation form
        try {
            // URL input
            const urlInput = page.locator('input[placeholder*="url" i], input[name*="url" i]').first();
            await urlInput.waitFor({ state: "visible", timeout: 5000 });
            await urlInput.click();
            await urlInput.type("https://store.google.com/us/category/phones", { delay: 50 });
            await page.waitForTimeout(500);

            // Prompt input
            const promptInput = page.locator('textarea').first();
            await promptInput.click();
            await promptInput.type("Show Pixel phone camera and AI features", { delay: 50 });
            await page.waitForTimeout(500);

            await page.screenshot({ path: path.join(OUTPUT_DIR, "demo_05_form_filled.png") });
            console.log("  ✅ Form filled");
        } catch (e) {
            console.log("  ⚠️ Could not fill generate form:", (e as Error).message);
        }

        // ============================================================
        // SCENE 5: Demo Library
        // ============================================================
        console.log("🎬 Scene 5: Demo Library");
        await page.goto(`${APP_URL}/dashboard/demos`, { waitUntil: "domcontentloaded", timeout: 30000 });
        await page.waitForTimeout(3000);
        await page.screenshot({ path: path.join(OUTPUT_DIR, "demo_06_library.png") });
        console.log("  ✅ Demo library captured");

        // Click on the first demo if available
        try {
            const demoCard = page.locator('a[href*="/dashboard/demos/"]').first();
            await demoCard.waitFor({ state: "visible", timeout: 5000 });
            await demoCard.click();
            await page.waitForTimeout(3000);
            await page.screenshot({ path: path.join(OUTPUT_DIR, "demo_07_video_detail.png") });
            console.log("  ✅ Video detail page captured");

            // Scroll to see the script
            await page.evaluate(() => window.scrollBy(0, 500));
            await page.waitForTimeout(1000);
            await page.screenshot({ path: path.join(OUTPUT_DIR, "demo_08_script_view.png") });
            console.log("  ✅ Script view captured");
        } catch (e) {
            console.log("  ⚠️ No demos found in library");
        }

    } catch (err) {
        console.error("❌ Error:", err);
    }

    // Close context to save recording
    await context.close();
    await browser.close();

    console.log("\n========================================");
    console.log("✅ Demo recording complete!");
    console.log(`📁 Output: ${OUTPUT_DIR}`);
    console.log("========================================\n");

    // List generated files
    const files = fs.readdirSync(OUTPUT_DIR).filter(f => 
        f.endsWith(".png") || f.endsWith(".webm")
    );
    console.log("Files:");
    files.forEach(f => {
        const size = fs.statSync(path.join(OUTPUT_DIR, f)).size;
        console.log(`  📄 ${f} (${(size / 1024).toFixed(0)} KB)`);
    });
}

main().catch(console.error);
