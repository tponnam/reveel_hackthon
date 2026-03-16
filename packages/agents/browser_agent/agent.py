"""
DemoForge Browser Capture Agent

Uses Playwright to autonomously navigate a web application,
capture screenshots at key interaction points, and record
the entire session as a video.
"""

import os
import json
import asyncio
from typing import Optional, Dict, Any, List

from playwright.async_api import async_playwright, Browser, Page, BrowserContext


class BrowserCaptureAgent:
    """
    Autonomous browser agent that navigates a web app and captures the flow.

    Capabilities:
    - Navigate to URLs
    - Click elements by CSS selector or text
    - Type into inputs with realistic test data
    - Scroll pages
    - Capture high-quality screenshots
    - Record the entire session as video
    - Fill forms with AI-generated realistic data
    """

    def __init__(self, config):
        self.config = config
        self.browser: Optional[Browser] = None
        self.context: Optional[BrowserContext] = None
        self.page: Optional[Page] = None
        self.screenshots: List[str] = []

    async def run(self, state) -> Any:
        """Execute the browser capture pipeline."""
        try:
            await self._setup_browser(state)
            await self._execute_navigation(state)
            await self._cleanup()
        except Exception as e:
            await self._cleanup()
            raise RuntimeError(f"Browser capture failed: {e}")

        return state

    async def _setup_browser(self, state):
        """Initialize Playwright browser with recording enabled."""
        self.pw = await async_playwright().start()
        self.browser = await self.pw.chromium.launch(
            headless=self.config.browser.headless,
            slow_mo=self.config.browser.slow_mo,
        )

        # Set up video recording
        video_dir = os.path.join(state.work_dir, "recordings")
        os.makedirs(video_dir, exist_ok=True)

        self.context = await self.browser.new_context(
            viewport={
                "width": self.config.browser.viewport_width,
                "height": self.config.browser.viewport_height,
            },
            record_video_dir=video_dir,
            record_video_size={
                "width": self.config.browser.viewport_width,
                "height": self.config.browser.viewport_height,
            },
        )

        self.page = await self.context.new_page()
        self.page.set_default_timeout(self.config.browser.default_timeout)

    async def _execute_navigation(self, state):
        """Execute the planned navigation steps."""
        steps = state.analysis.get("navigation_steps", [])
        screenshots_dir = os.path.join(state.work_dir, "screenshots")
        os.makedirs(screenshots_dir, exist_ok=True)

        for i, step in enumerate(steps):
            action = step.get("action", "navigate")
            target = step.get("target", "")
            data = step.get("data", "")
            emphasis = step.get("emphasis", False)

            try:
                if action == "navigate":
                    url = target if target.startswith("http") else state.request.url
                    await self.page.goto(url, wait_until="networkidle")
                    await asyncio.sleep(1)

                elif action == "click":
                    element = await self._find_element(target)
                    if element:
                        await element.scroll_into_view_if_needed()
                        await asyncio.sleep(0.3)
                        await element.click()
                        await asyncio.sleep(0.5)

                elif action == "type":
                    element = await self._find_element(target)
                    if element:
                        await element.scroll_into_view_if_needed()
                        await element.click()
                        # Type character by character for a realistic feel
                        text = data or self._generate_test_data(target)
                        await element.type(text, delay=50)
                        await asyncio.sleep(0.3)

                elif action == "scroll":
                    direction = data or "down"
                    pixels = 500
                    if direction == "down":
                        await self.page.evaluate(f"window.scrollBy(0, {pixels})")
                    elif direction == "up":
                        await self.page.evaluate(f"window.scrollBy(0, -{pixels})")
                    await asyncio.sleep(0.5)

                elif action == "wait":
                    wait_time = float(data) if data else 1.0
                    await asyncio.sleep(wait_time)

                elif action == "hover":
                    element = await self._find_element(target)
                    if element:
                        await element.hover()
                        await asyncio.sleep(0.5)

                elif action == "select":
                    element = await self._find_element(target)
                    if element:
                        await element.select_option(data)
                        await asyncio.sleep(0.3)

                # Capture screenshot after each step
                screenshot_path = os.path.join(
                    screenshots_dir, f"step_{i:03d}_{action}.png"
                )
                await self.page.screenshot(
                    path=screenshot_path,
                    full_page=False,
                    type="png",
                )
                state.screenshots.append(screenshot_path)

                # Extra screenshot for emphasized steps (for zoom effects)
                if emphasis:
                    element = await self._find_element(target) if target else None
                    if element:
                        box = await element.bounding_box()
                        if box:
                            emphasis_path = os.path.join(
                                screenshots_dir,
                                f"step_{i:03d}_{action}_emphasis.png",
                            )
                            await self.page.screenshot(
                                path=emphasis_path,
                                clip={
                                    "x": max(0, box["x"] - 50),
                                    "y": max(0, box["y"] - 50),
                                    "width": box["width"] + 100,
                                    "height": box["height"] + 100,
                                },
                            )
                            state.screenshots.append(emphasis_path)

            except Exception as e:
                print(f"Warning: Step {i} ({action}) failed: {e}")
                # Continue with next step on failure
                continue

        # Wait a bit for final content to load
        await asyncio.sleep(1)

        # Final full-page screenshot
        final_path = os.path.join(screenshots_dir, "final_fullpage.png")
        await self.page.screenshot(path=final_path, full_page=True)
        state.screenshots.append(final_path)

    async def _find_element(self, target: str):
        """Find an element by CSS selector, text, or role."""
        try:
            # Try CSS selector first
            element = self.page.locator(target)
            if await element.count() > 0:
                return element.first
        except Exception:
            pass

        try:
            # Try by text
            element = self.page.get_by_text(target, exact=False)
            if await element.count() > 0:
                return element.first
        except Exception:
            pass

        try:
            # Try by role
            element = self.page.get_by_role("button", name=target)
            if await element.count() > 0:
                return element.first
        except Exception:
            pass

        try:
            # Try by placeholder
            element = self.page.get_by_placeholder(target)
            if await element.count() > 0:
                return element.first
        except Exception:
            pass

        return None

    def _generate_test_data(self, field_hint: str) -> str:
        """Generate realistic test data based on field context."""
        field_lower = field_hint.lower()

        test_data = {
            "email": "sarah.chen@demoforge.com",
            "name": "Sarah Chen",
            "first": "Sarah",
            "last": "Chen",
            "company": "Acme Technologies",
            "phone": "+1 (555) 123-4567",
            "address": "123 Innovation Drive",
            "city": "San Francisco",
            "state": "California",
            "zip": "94105",
            "country": "United States",
            "url": "https://acmetech.com",
            "password": "SecureDemo2024!",
            "search": "product demo automation",
            "message": "I'd like to learn more about your enterprise plan.",
            "title": "Head of Product Marketing",
        }

        for key, value in test_data.items():
            if key in field_lower:
                return value

        return "Demo User Input"

    async def _cleanup(self):
        """Close browser and save recording."""
        if self.context:
            await self.context.close()
        if self.browser:
            await self.browser.close()
        if hasattr(self, "pw"):
            await self.pw.stop()
