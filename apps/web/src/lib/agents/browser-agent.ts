/**
 * Reveel AI — Browser Capture Agent
 *
 * Uses Playwright to navigate a target URL, execute AI-planned interaction
 * steps, and RECORD A VIDEO of the entire session using Playwright's
 * built-in `recordVideo` capability.
 *
 * Also captures key screenshots at important moments for thumbnails.
 */

import { chromium, Browser, Page } from "playwright";
import path from "path";
import fs from "fs";
import type { PipelineState, NavigationStep } from "./types";

export class BrowserCaptureAgent {
    private browser: Browser | null = null;

    async captureThumbnail(state: PipelineState): Promise<PipelineState> {
        const screenshotsDir = path.join(state.workDir, "screenshots");
        fs.mkdirSync(screenshotsDir, { recursive: true });

        try {
            this.browser = await chromium.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
            const page = await this.browser.newPage();
            
            await page.goto(state.request.url, { waitUntil: "domcontentloaded", timeout: 30000 }).catch(() => {});
            
            const thumbPath = path.join(screenshotsDir, "thumbnail.png");
            await page.screenshot({ path: thumbPath, fullPage: false });
            state.screenshots.push(thumbPath);
            
            console.log(`[BrowserAgent] Captured thumbnail: ${thumbPath}`);
        } catch (err: any) {
            console.warn("[BrowserAgent] Thumbnail capture failed:", err.message);
        } finally {
            if (this.browser) {
                await this.browser.close();
                this.browser = null;
            }
        }
        return state;
    }

    async run(state: PipelineState): Promise<PipelineState> {
        const videoDir = path.join(state.workDir, "recording");
        const screenshotsDir = path.join(state.workDir, "screenshots");
        fs.mkdirSync(videoDir, { recursive: true });
        fs.mkdirSync(screenshotsDir, { recursive: true });

        // Determine resolution from request
        const resMap: Record<string, { w: number; h: number }> = {
            "720p": { w: 1280, h: 720 },
            "1080p": { w: 1920, h: 1080 },
            "1440p (2K)": { w: 2560, h: 1440 },
            "4K": { w: 3840, h: 2160 },
        };
        const res = resMap[state.request.resolution] || resMap["1080p"];

        try {
            this.browser = await chromium.launch({
                headless: true,
                args: ["--no-sandbox", "--disable-setuid-sandbox"],
            });

            // Create context WITH video recording enabled
            const context = await this.browser.newContext({
                viewport: { width: res.w, height: res.h },
                deviceScaleFactor: 2,
                recordVideo: {
                    dir: videoDir,
                    size: { width: res.w, height: res.h },
                },
            });

            await context.addInitScript(() => {
                const initCursor = () => {
                    if (document.getElementById('playwright-cursor')) return;
                    
                    const cursor = document.createElement("div");
                    cursor.id = "playwright-cursor";
                    cursor.style.position = "fixed";
                    cursor.style.top = "0";
                    cursor.style.left = "0";
                    cursor.style.width = "20px";
                    cursor.style.height = "20px";
                    cursor.style.borderRadius = "50%";
                    cursor.style.backgroundColor = "rgba(220, 38, 38, 0.4)";
                    cursor.style.border = "2px solid rgba(220, 38, 38, 1)";
                    cursor.style.pointerEvents = "none";
                    cursor.style.zIndex = "999999";
                    cursor.style.transition = "transform 0.1s";
                    cursor.style.transform = "translate(-50%, -50%)";
                    
                    document.body.appendChild(cursor);

                    document.addEventListener("mousemove", (e) => {
                        cursor.style.left = e.clientX + "px";
                        cursor.style.top = e.clientY + "px";
                    });

                    document.addEventListener("mousedown", (e) => {
                        cursor.style.transform = "translate(-50%, -50%) scale(0.7)";
                        cursor.style.backgroundColor = "rgba(220, 38, 38, 0.8)";
                        
                        const ripple = document.createElement("div");
                        ripple.style.position = "fixed";
                        ripple.style.left = e.clientX + "px";
                        ripple.style.top = e.clientY + "px";
                        ripple.style.width = "20px";
                        ripple.style.height = "20px";
                        ripple.style.borderRadius = "50%";
                        ripple.style.backgroundColor = "transparent";
                        ripple.style.border = "2px solid rgba(220, 38, 38, 0.8)";
                        ripple.style.pointerEvents = "none";
                        ripple.style.zIndex = "999998";
                        ripple.style.transform = "translate(-50%, -50%)";
                        ripple.style.transition = "all 0.5s ease-out";
                        
                        document.body.appendChild(ripple);
                        
                        setTimeout(() => {
                            ripple.style.width = "60px";
                            ripple.style.height = "60px";
                            ripple.style.opacity = "0";
                        }, 10);
                        
                        setTimeout(() => {
                            ripple.remove();
                        }, 500);
                    });

                    document.addEventListener("mouseup", () => {
                        cursor.style.transform = "translate(-50%, -50%) scale(1)";
                        cursor.style.backgroundColor = "rgba(220, 38, 38, 0.4)";
                    });
                };
                
                if (document.readyState === 'interactive' || document.readyState === 'complete') {
                    initCursor();
                } else {
                    document.addEventListener('DOMContentLoaded', initCursor);
                }
            });

            const page = await context.newPage();

            // Navigate to target URL
            await page.goto(state.request.url, {
                waitUntil: "domcontentloaded",
                timeout: 60000,
            });

            // Capture initial thumbnail screenshot
            const thumbPath = path.join(screenshotsDir, "thumbnail.png");
            await page.screenshot({ path: thumbPath, fullPage: false });
            state.screenshots.push(thumbPath);

            // Wait a bit on landing page so viewer can see it
            await page.waitForTimeout(2000);

            // Calculate how long to wait per step to fill out the exactly timed audio duration
            const audioDurationMs = state.audioDurationMs || (state.analysis?.estimatedDurationSeconds || 30) * 1000;
            const fixedDelays = 2000 + 1500; // 2s landing page + 1.5s final pause
            const remainingDurationMs = Math.max(0, audioDurationMs - fixedDelays);
            const numSteps = state.analysis?.navigationSteps?.length || 1;
            
            // Aim to distribute the remaining time equally across the steps
            const stepDelayMs = Math.max(2000, Math.floor(remainingDurationMs / numSteps));

            // Execute navigation steps from the AI analysis
            if (state.analysis?.navigationSteps) {
                for (const step of state.analysis.navigationSteps) {
                    await this.executeStep(page, step, screenshotsDir, state, stepDelayMs);
                }
            }

            // Final pause so the recording captures the last screen
            await page.waitForTimeout(1500);

            // Close context to finalize the video file
            await context.close();

            // Find the recorded video file (Playwright saves it in videoDir)
            const videoFiles = fs.readdirSync(videoDir).filter(f => f.endsWith(".webm"));
            if (videoFiles.length > 0) {
                state.recordingPath = path.join(videoDir, videoFiles[0]);
                console.log(`[BrowserAgent] Video recorded: ${state.recordingPath}`);
            }
        } catch (err: any) {
            console.error("[BrowserAgent] Error:", err.message);
        } finally {
            if (this.browser) {
                await this.browser.close();
                this.browser = null;
            }
        }

        return state;
    }

    private async executeStep(
        page: Page,
        step: NavigationStep,
        screenshotsDir: string,
        state: PipelineState,
        stepDelayMs: number
    ) {
        try {
            switch (step.action) {
                case "navigate":
                    await page.goto(step.target, { waitUntil: "domcontentloaded", timeout: 45000 });
                    break;

                case "click": {
                    let clickLocator = null;
                    let box = null;
                    
                    // Try multiple strategies to find the element
                    const clickStrategies = [
                        () => page.getByRole('button', { name: step.target, exact: false }).first(),
                        () => page.getByRole('link', { name: step.target, exact: false }).first(),
                        () => page.getByText(step.target, { exact: false }).first(),
                        () => page.locator(step.target).first()
                    ];

                    for (const strategy of clickStrategies) {
                        try {
                            const loc = strategy();
                            await loc.waitFor({ state: 'visible', timeout: 3000 });
                            const b = await loc.boundingBox();
                            if (b) {
                                clickLocator = loc;
                                box = b;
                                break;
                            }
                        } catch (e) {
                            // continue trying
                        }
                    }

                    if (!box) {
                        console.warn(`[BrowserAgent] Could not find viable click target for: ${step.target}`);
                    }

                    if (box && clickLocator) {
                        const targetX = box.x + box.width / 2;
                        const targetY = box.y + box.height / 2;
                        await page.mouse.move(targetX, targetY, { steps: 50 });
                        await page.waitForTimeout(200);
                        
                        // Add highlight class briefly using evaluate
                        await clickLocator.evaluate((el: HTMLElement) => {
                            const originalOutline = el.style.outline;
                            const originalTransition = el.style.transition;
                            el.style.transition = "outline 0.2s ease-out";
                            el.style.outline = "2px solid rgba(220, 38, 38, 0.8)";
                            setTimeout(() => {
                                el.style.outline = originalOutline;
                                setTimeout(() => {
                                    el.style.transition = originalTransition;
                                }, 200);
                            }, 400);
                        }).catch(() => {});
                        
                        await page.mouse.down();
                        await page.waitForTimeout(100);
                        await page.mouse.up();
                    }
                    break;
                }

                case "type": {
                    let typeLocator = null;
                    let typeBox = null;
                    
                    const typeStrategies = [
                        () => page.getByPlaceholder(step.target, { exact: false }).first(),
                        () => page.getByRole('textbox', { name: step.target }).first(),
                        () => page.locator(step.target).first()
                    ];

                    for (const strategy of typeStrategies) {
                        try {
                            const loc = strategy();
                            await loc.waitFor({ state: 'visible', timeout: 3000 });
                            const b = await loc.boundingBox();
                            if (b) {
                                typeLocator = loc;
                                typeBox = b;
                                break;
                            }
                        } catch (e) {
                            // continue trying
                        }
                    }

                    if (!typeBox) {
                        console.warn(`[BrowserAgent] Could not find viable type target for: ${step.target}`);
                    }

                    if (step.data && typeBox && typeLocator) {
                        // Move mouse to input
                        const targetX = typeBox.x + typeBox.width / 2;
                        const targetY = typeBox.y + typeBox.height / 2;
                        await page.mouse.move(targetX, targetY, { steps: 30 });
                        await page.waitForTimeout(100);
                        await page.mouse.click(targetX, targetY);
                        await page.waitForTimeout(200);
                        
                        // Highlight the input while typing
                        await typeLocator.evaluate((el: HTMLElement) => {
                            el.style.boxShadow = "0 0 0 3px rgba(220, 38, 38, 0.3)";
                            el.style.transition = "box-shadow 0.2s ease-out";
                        }).catch(() => {});
                        
                        // Type with delay
                        await typeLocator.type(step.data, { delay: 100 });
                        
                        // Remove highlight
                        await typeLocator.evaluate((el: HTMLElement) => {
                            el.style.boxShadow = "none";
                        }).catch(() => {});
                    }
                    break;
                }

                case "scroll":
                    const viewport = page.viewportSize();
                    if (viewport) {
                        await page.mouse.move(
                            viewport.width / 2 + (Math.random() * 100 - 50), 
                            viewport.height / 2 + (Math.random() * 100 - 50), 
                            { steps: 20 }
                        ).catch(() => {});
                    }
                    await page.evaluate(() => window.scrollBy({ top: window.innerHeight * 0.8, behavior: "smooth" }));
                    break;

                case "wait":
                    await page.waitForTimeout(2000);
                    break;
            }

            // Wait for transitions and animations to settle, giving the recording some length
            await page.waitForTimeout(stepDelayMs);

            // Capture a screenshot at key "emphasis" moments for thumbnails
            if (step.emphasis) {
                const shotPath = path.join(screenshotsDir, `step_${step.stepNumber}.png`);
                await page.screenshot({ path: shotPath, fullPage: false });
                state.screenshots.push(shotPath);
            }
        } catch (err: any) {
            console.warn(`[BrowserAgent] Step ${step.stepNumber} failed: ${err.message}`);
        }
    }
}
