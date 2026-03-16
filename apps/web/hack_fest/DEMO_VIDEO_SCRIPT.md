# Reveel AI — Demo Video Script (< 4 minutes)

## Opening (0:00 – 0:20)

**[Screen: Reveel AI landing page]**

"Hi, I'm [Your Name], and I built Reveel AI — a fully autonomous, multi-agent system that turns any website URL into a professional narrated demo video in under 2 minutes."

"Product demo videos cost thousands of dollars and take weeks to produce. Reveel eliminates that entirely by using Gemini AI, Playwright, and Google Cloud."

---

## Problem Statement (0:20 – 0:40)

**[Screen: Show a slide or text overlay]**

"Marketing teams spend $2,000 to $10,000 per product demo video. They take 1-3 weeks to produce. And when the product updates? The videos become stale immediately."

"Reveel AI solves this by generating demos instantly, on-demand, for any website."

---

## Live Demo (0:40 – 3:00)

### Step 1: Enter a URL (0:40 – 1:00)
**[Screen: Navigate to Dashboard → New Demo]**

"Let me show you. I'll paste in the Google Pixel Store URL and ask it to showcase Pixel phone features — camera, AI, and design."

- Type URL: `https://store.google.com/us/category/phones`
- Type prompt: "Show Pixel phone camera and AI features"
- Select persona: Product Manager
- Click **Start Generation**

### Step 2: AI Analysis + Script (1:00 – 1:30)
**[Screen: Show phase 1 progress, then the script review page]**

"In seconds, Gemini 2.0 Flash analyzed the website — understanding its structure, products, and features. It generated a 9-paragraph narration script tailored for a Product Manager audience."

"I can review and edit the script before proceeding. Let me approve it."

- Click **Approve & Synthesize**

### Step 3: Video Generation (1:30 – 2:20)
**[Screen: Show Phase 2 progress bar advancing]**

"Now the magic happens. Behind the scenes, six autonomous agents are working together:"

"The Voice Agent synthesizes the voiceover. The Browser Agent launches a headless Chromium browser and records real interactions — with smooth mouse movements and visual highlights — paced precisely to match the audio duration."

"The Video Agent normalizes the audio and merges everything into a polished MP4. The Storage Agent uploads it to Google Cloud Storage."

**[Screen: Final video appears with play button]**

### Step 4: Play the Result (2:20 – 2:50)
**[Screen: Click play on the generated video]**

"And here's the result — a fully narrated, professionally recorded demo video. The voiceover is perfectly synchronized with the browser actions. No editing, no templates, no post-production."

- Play the video for 15-20 seconds so judges can hear the voiceover

---

## Architecture & Tech (2:50 – 3:30)

**[Screen: Show architecture diagram]**

"Let me quickly walk through the architecture:"

"The frontend is Next.js 16 with React 19, hosted on Firebase. Authentication uses Firebase Auth with Google Sign-In."

"The backend runs on Google Cloud Run as a Docker container that includes Chromium, FFmpeg, and Node.js."

"The AI pipeline has six specialized agents, each focused on one task. The Orchestrator uses Gemini to analyze URLs and coordinate everything. Firestore provides real-time progress updates to the dashboard."

"Everything runs on Google Cloud — Cloud Run for compute, Cloud Build for CI/CD, Firebase for auth and storage, and Gemini API for intelligence."

---

## Closing (3:30 – 3:50)

**[Screen: Dashboard showing the library of generated demos]**

"Reveel AI demonstrates how multimodal AI agents can automate complex, creative workflows. What used to take weeks and thousands of dollars now happens in under 2 minutes."

"Thank you!"

---

## Recording Tips

1. **Resolution**: Record at 1920×1080 (1080p)
2. **Audio**: Use a quiet room with a good microphone
3. **Pace**: Speak clearly and don't rush
4. **Pre-generate**: Have a demo already generated to show the final result quickly (in case the live generation takes time)
5. **Browser**: Use Chrome in full-screen mode
6. **Timer**: Keep a timer visible to stay under 4 minutes
