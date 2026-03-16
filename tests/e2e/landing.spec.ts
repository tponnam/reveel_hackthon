import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
    test("should render the hero section with correct heading", async ({ page }) => {
        await page.goto("/");
        await expect(page.locator("h1")).toContainText("AI Demo Agent");
        await expect(page.locator("text=Get Started Free").first()).toBeVisible();
    });

    test("should render all major sections", async ({ page }) => {
        await page.goto("/");

        // Hero
        await expect(page.locator("text=Turn your product into")).toBeVisible();

        // Pain Points
        await expect(page.locator("text=Manual screen recording")).toBeVisible();

        // Features
        await page.locator("#features").scrollIntoViewIfNeeded();
        await expect(page.locator("text=Everything you need to")).toBeVisible();

        // How It Works
        await page.locator("#how-it-works").scrollIntoViewIfNeeded();
        await expect(page.locator("text=Go from URL to demo")).toBeVisible();

        // Pricing
        await page.locator("#pricing").scrollIntoViewIfNeeded();
        await expect(page.locator("text=Simple pricing")).toBeVisible();

        // FAQ
        await page.locator("#faq").scrollIntoViewIfNeeded();
        await expect(page.locator("text=Got questions?")).toBeVisible();
    });

    test("should have working navigation links", async ({ page }) => {
        await page.goto("/");

        // Click Features nav link
        await page.click('nav >> text=Features');
        await expect(page.locator("#features")).toBeInViewport();
    });

    test("should show pricing plans with toggle", async ({ page }) => {
        await page.goto("/");
        await page.locator("#pricing").scrollIntoViewIfNeeded();

        // Check all plan names exist
        await expect(page.locator("text=Free Trial")).toBeVisible();
        await expect(page.locator("text=Starter")).toBeVisible();
        await expect(page.locator("text=Pro")).toBeVisible();
        await expect(page.locator("text=Business")).toBeVisible();

        // Toggle to yearly
        await page.click("text=Yearly");
        await expect(page.locator("text=Save 17%")).toBeVisible();
    });

    test("should expand FAQ items on click", async ({ page }) => {
        await page.goto("/");
        await page.locator("#faq").scrollIntoViewIfNeeded();

        const firstQuestion = page.locator("text=What exactly is DemoForge?");
        await firstQuestion.click();

        await expect(
            page.locator("text=AI demo agent that turns your product URL")
        ).toBeVisible();
    });

    test("should have responsive mobile menu", async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 812 });
        await page.goto("/");

        // Desktop nav should be hidden
        await expect(page.locator("nav.hidden.md\\:flex")).not.toBeVisible();

        // Mobile menu button should be visible
        const menuButton = page.locator('button[aria-label="Toggle menu"]');
        await expect(menuButton).toBeVisible();

        // Open mobile menu
        await menuButton.click();
        await expect(page.locator("text=Features").first()).toBeVisible();
    });
});

test.describe("Auth Pages", () => {
    test("should render sign in page", async ({ page }) => {
        await page.goto("/auth/signin");
        await expect(page.locator("text=Welcome back")).toBeVisible();
        await expect(page.locator("text=Continue with Google")).toBeVisible();
        await expect(page.locator('input[type="email"]')).toBeVisible();
        await expect(page.locator('input[type="password"]')).toBeVisible();
    });

    test("should render sign up page", async ({ page }) => {
        await page.goto("/auth/signup");
        await expect(page.locator("text=Create your account")).toBeVisible();
        await expect(page.locator('input[placeholder="Sarah Chen"]')).toBeVisible();
        await expect(page.locator('input[type="email"]')).toBeVisible();
    });

    test("should navigate between auth pages", async ({ page }) => {
        await page.goto("/auth/signin");
        await page.click("text=Sign up");
        await expect(page).toHaveURL(/\/auth\/signup/);

        await page.click("text=Sign in");
        await expect(page).toHaveURL(/\/auth\/signin/);
    });
});

test.describe("API Routes", () => {
    test("should create a new demo via POST /api/demos", async ({ request }) => {
        const response = await request.post("/api/demos", {
            data: {
                url: "https://example.com",
                prompt: "Show the homepage",
                language: "en-US",
                resolution: "1080p",
            },
        });

        expect(response.status()).toBe(201);
        const body = await response.json();
        expect(body.id).toBeTruthy();
        expect(body.status).toBe("pending");
    });

    test("should list demos via GET /api/demos", async ({ request }) => {
        const response = await request.get("/api/demos");
        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body.demos).toBeDefined();
    });

    test("should validate required fields on POST /api/demos", async ({ request }) => {
        const response = await request.post("/api/demos", {
            data: { url: "" },
        });
        expect(response.status()).toBe(400);
    });
});
