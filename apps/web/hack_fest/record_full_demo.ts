/**
 * Reveel AI — Full Platform Demo Recorder
 * 
 * Records a complete end-to-end demo of generating a Mac Mini
 * explainer video from apple.com using the Reveel AI platform.
 * 
 * This produces a .webm video recording suitable for hackathon submission.
 * 
 * Usage:
 *   npx tsx hack_fest/record_full_demo.ts
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
        slowMo: 200,
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
        await page.goto(APP_URL, { waitUntil: "networkidle", timeout: 30000 });
        await page.waitForTimeout(4000);
        await page.screenshot({ path: path.join(OUTPUT_DIR, "scene_01_landing.png") });
        console.log("  ✅ Landing page shown");

        // ============================================================
        // SCENE 2: Sign In
        // ============================================================
        console.log("🎬 Scene 2: Sign In");
        // Click Sign In in nav
        try {
            await page.click('text=Sign In', { timeout: 5000 });
        } catch {
            await page.goto(`${APP_URL}/auth/signin`, { waitUntil: "domcontentloaded", timeout: 30000 });
        }
        await page.waitForTimeout(2000);

        // Fill email slowly
        const emailInput = page.locator('input[type="email"], input[placeholder*="email" i], [name="email"]').first();
        await emailInput.waitFor({ state: "visible", timeout: 10000 });
        await emailInput.click();
        await page.waitForTimeout(500);
        await emailInput.fill(""); // Clear first
        await emailInput.type("demotest@reveel.ai", { delay: 100 });
        await page.waitForTimeout(800);

        // Fill password
        const passwordInput = page.locator('input[type="password"], [name="password"]').first();
        await passwordInput.click();
        await page.waitForTimeout(300);
        await passwordInput.fill(""); // Clear first
        await passwordInput.type("Demo@1234", { delay: 100 });
        await page.waitForTimeout(800);

        await page.screenshot({ path: path.join(OUTPUT_DIR, "scene_02_signin.png") });
        console.log("  ✅ Credentials filled");

        // Submit and wait for navigation
        const submitBtn = page.locator('button[type="submit"], button:has-text("Sign In"), button:has-text("Login")').first();
        await submitBtn.click();
        
        // Wait for dashboard or error
        await page.waitForTimeout(10000); 
        await page.screenshot({ path: path.join(OUTPUT_DIR, "scene_02b_after_signin.png") });

        // ============================================================
        // SCENE 3: Dashboard
        // ============================================================
        console.log("🎬 Scene 3: Dashboard");
        if (!page.url().includes("/dashboard")) {
            console.log("  ⚠️ Not on dashboard after signin, attempting direct goto");
            await page.goto(`${APP_URL}/dashboard`, { waitUntil: "networkidle", timeout: 30000 });
        }
        await page.waitForTimeout(5000);
        await page.screenshot({ path: path.join(OUTPUT_DIR, "scene_03_dashboard.png") });
        
        if (page.url().includes("signin") || page.url().includes("login")) {
            console.error("❌ Still on login page after redirection attempt!");
            throw new Error("Login failed or session did not persist");
        }
        console.log("  ✅ Dashboard verified");

        // ============================================================
        // SCENE 4: Navigate to Generate
        // ============================================================
        console.log("🎬 Scene 4: Generate Page");
        // Click "New Demo" in sidebar or main area card
        try {
            // Try the main card first as it's more reliable in the demo
            const generateCard = page.locator('text=Generate Demo Video, [role="button"]:has-text("Generate")').first();
            if (await generateCard.isVisible()) {
                await generateCard.click();
                console.log("  ✅ Clicked Generate card in main area");
            } else {
                const sidebarLink = page.locator('nav a[href*="generate"], text=New Demo').first();
                await sidebarLink.click();
                console.log("  ✅ Clicked New Demo sidebar link");
            }
        } catch (e) {
            console.log("  ⚠️ Navigation click failed, using goto");
            await page.goto(`${APP_URL}/dashboard/generate`, { waitUntil: "domcontentloaded", timeout: 30000 });
        }
        
        await page.waitForTimeout(5000);
        await page.screenshot({ path: path.join(OUTPUT_DIR, "scene_04_generate.png") });
        
        if (page.url().includes("signin")) {
            console.error("❌ Redirected to login page when trying to generate!");
            // One last attempt to goto /dashboard/generate after another delay
            await page.waitForTimeout(3000);
            await page.goto(`${APP_URL}/dashboard/generate`, { waitUntil: "networkidle", timeout: 30000 });
            await page.screenshot({ path: path.join(OUTPUT_DIR, "scene_04_retry.png") });
        }
        console.log("  ✅ Generate page verified");

        // ============================================================
        // SCENE 5: Fill the Form
        // ============================================================
        console.log("🎬 Scene 5: Filling form");

        // Find URL input - try multiple selectors
        let urlFilled = false;
        const urlSelectors = [
            'input[name="targetUrl"]',
            'input[placeholder*="url" i]',
            'input[name*="url" i]',
            'input[placeholder*="target" i]',
            'input[type="url"]',
        ];

        for (const sel of urlSelectors) {
            try {
                const input = page.locator(sel).first();
                if (await input.isVisible({ timeout: 2000 })) {
                    await input.click();
                    await input.fill("");
                    await input.type("https://www.apple.com/mac-mini/", { delay: 60 });
                    urlFilled = true;
                    console.log(`  ✅ URL filled using: ${sel}`);
                    break;
                }
            } catch { continue; }
        }

        if (!urlFilled) {
            // Try finding by label
            try {
                const input = page.getByLabel(/url/i).first();
                await input.click();
                await input.type("https://www.apple.com/mac-mini/", { delay: 60 });
                urlFilled = true;
                console.log("  ✅ URL filled using label");
            } catch {
                console.log("  ⚠️ Could not find URL input");
            }
        }

        await page.waitForTimeout(800);

        // Find prompt/objective textarea
        let promptFilled = false;
        const promptSelectors = [
            'textarea[placeholder*="prompt" i]',
            'textarea[placeholder*="objective" i]',
            'textarea[placeholder*="describe" i]',
            'textarea',
        ];

        for (const sel of promptSelectors) {
            try {
                const textarea = page.locator(sel).first();
                await textarea.waitFor({ state: "visible", timeout: 2000 });
                await textarea.click();
                await page.waitForTimeout(300);
                await textarea.type(
                    "Create an explainer video about Mac Mini highlighting its M4 chip performance, compact design, and pricing",
                    { delay: 40 }
                );
                promptFilled = true;
                console.log(`  ✅ Prompt filled using: ${sel}`);
                break;
            } catch { continue; }
        }

        await page.waitForTimeout(1000);

        // Try selecting Product Manager persona
        try {
            const persona = page.getByText("Product Manager").first();
            await persona.waitFor({ state: "visible", timeout: 2000 });
            await persona.click();
            console.log("  ✅ Product Manager persona selected");
        } catch {
            console.log("  ⚠️ Could not select persona");
        }

        await page.waitForTimeout(1000);
        await page.screenshot({ path: path.join(OUTPUT_DIR, "scene_05_form_filled.png") });
        console.log("  ✅ Form filled");

        // ============================================================
        // SCENE 6: Start Generation (Phase 1)
        // ============================================================
        console.log("🎬 Scene 6: Starting Generation");
        
        // Scroll to the button
        await page.evaluate(() => window.scrollBy(0, 300));
        await page.waitForTimeout(500);

        // Click Start Generation
        try {
            const startBtn = page.getByText(/Start Generation/i).first();
            await startBtn.waitFor({ state: "visible", timeout: 5000 });
            await startBtn.click();
            console.log("  ✅ Clicked Start Generation");
        } catch {
            try {
                await page.click('button:has-text("Generate")', { timeout: 3000 });
                console.log("  ✅ Clicked Generate button");
            } catch {
                console.log("  ⚠️ Could not find generate button");
            }
        }

        await page.waitForTimeout(3000);
        await page.screenshot({ path: path.join(OUTPUT_DIR, "scene_06_generating.png") });

        // ============================================================
        // SCENE 7: Wait for Phase 1 (Script Generation)
        // ============================================================
        console.log("🎬 Scene 7: Waiting for Phase 1...");
        
        // Poll for the Approve button or script to appear
        let phase1Complete = false;
        for (let i = 0; i < 60; i++) {  // Max 10 minutes
            await page.waitForTimeout(10000);
            
            // Check for approve button specifically
            try {
                // Look for an actual button containing 'Approve' to avoid matching 'synthesized' in loading text
                const approveBtn = page.locator('button:has-text("Approve"), button:has-text("Synthesize")').first();
                const isVisible = await approveBtn.isVisible();
                if (isVisible) {
                    phase1Complete = true;
                    console.log(`  ✅ Phase 1 complete after ${(i + 1) * 10}s`);
                    break;
                }
            } catch {}
            
            // Also check for script text
            try {
                const scriptEl = page.locator('text=Review AI Script').first();
                const isVisible = await scriptEl.isVisible();
                if (isVisible) {
                    phase1Complete = true;
                    console.log(`  ✅ Script ready after ${(i + 1) * 10}s`);
                    break;
                }
            } catch {}

            console.log(`  ⏳ Waiting... ${(i + 1) * 10}s`);
        }

        await page.screenshot({ path: path.join(OUTPUT_DIR, "scene_07_script_review.png") });

        if (!phase1Complete) {
            console.log("  ⚠️ Phase 1 may not have completed, continuing anyway");
        }

        // Scroll to see the script
        await page.evaluate(() => window.scrollBy(0, 300));
        await page.waitForTimeout(2000);
        await page.screenshot({ path: path.join(OUTPUT_DIR, "scene_07b_script_detail.png") });

        // ============================================================
        // SCENE 8: Approve & Synthesize
        // ============================================================
        console.log("🎬 Scene 8: Approving script");
        
        try {
            const approveBtn = page.getByText(/Approve.*Synthesize/i).first();
            await approveBtn.waitFor({ state: "visible", timeout: 5000 });
            await approveBtn.click();
            console.log("  ✅ Clicked Approve & Synthesize");
        } catch {
            try {
                await page.click('button:has-text("Approve")', { timeout: 3000 });
                console.log("  ✅ Clicked Approve button");
            } catch {
                console.log("  ⚠️ Could not find approve button");
            }
        }

        await page.waitForTimeout(3000);
        await page.screenshot({ path: path.join(OUTPUT_DIR, "scene_08_synthesizing.png") });

        // ============================================================
        // SCENE 9: Wait for Phase 2 (Video Generation)
        // ============================================================
        console.log("🎬 Scene 9: Waiting for Phase 2 (video generation)...");
        
        let phase2Complete = false;
        for (let i = 0; i < 40; i++) {  // Max 10 minutes
            await page.waitForTimeout(15000);
            
            // Check for video player or completion
            try {
                const video = page.locator('video').first();
                const hasSrc = await video.getAttribute('src');
                if (hasSrc && hasSrc.length > 0) {
                    phase2Complete = true;
                    console.log(`  ✅ Phase 2 complete after ${(i + 1) * 15}s`);
                    break;
                }
            } catch {}
            
            // Check for "done" status
            try {
                const done = page.getByText(/completed|done|ready/i).first();
                const isVisible = await done.isVisible();
                if (isVisible) {
                    phase2Complete = true;
                    console.log(`  ✅ Video ready after ${(i + 1) * 15}s`);
                    break;
                }
            } catch {}

            console.log(`  ⏳ Generating video... ${(i + 1) * 15}s`);
        }

        await page.screenshot({ path: path.join(OUTPUT_DIR, "scene_09_video_result.png") });

        // ============================================================
        // SCENE 10: Play the Video
        // ============================================================
        console.log("🎬 Scene 10: Playing the video");
        
        try {
            // Try clicking the video or play button
            const video = page.locator('video').first();
            await video.click();
            await page.waitForTimeout(8000); // Let it play for 8 seconds
            await page.screenshot({ path: path.join(OUTPUT_DIR, "scene_10_playing.png") });
            console.log("  ✅ Video playing");
        } catch {
            console.log("  ⚠️ Could not play video");
        }

        // Final scroll to show the narration script below
        await page.evaluate(() => window.scrollBy(0, 500));
        await page.waitForTimeout(2000);
        await page.screenshot({ path: path.join(OUTPUT_DIR, "scene_11_script_below.png") });
        console.log("  ✅ Final screenshot with script");

    } catch (err) {
        console.error("❌ Error during demo:", err);
    }

    // Save the recording
    const videoPath = await page.video()?.path();
    await context.close();
    await browser.close();

    // Rename the recording
    if (videoPath && fs.existsSync(videoPath)) {
        const finalPath = path.join(OUTPUT_DIR, "reveel_demo_macmini.webm");
        fs.renameSync(videoPath, finalPath);
        console.log(`\n🎬 Demo recording saved: ${finalPath}`);
        console.log(`   Size: ${(fs.statSync(finalPath).size / 1024 / 1024).toFixed(1)} MB`);
    }

    console.log("\n========================================");
    console.log("✅ Full demo recording complete!");
    console.log(`📁 Output: ${OUTPUT_DIR}`);
    console.log("========================================\n");

    // List screenshots
    const screenshots = fs.readdirSync(OUTPUT_DIR).filter(f => f.startsWith("scene_"));
    console.log("Screenshots:");
    screenshots.forEach(f => console.log(`  📸 ${f}`));
}

main().catch(console.error);
