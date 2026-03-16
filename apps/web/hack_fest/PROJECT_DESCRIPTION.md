# Reveel AI — Project Description

## Summary

**Reveel AI** is an autonomous, multi-agent AI system that generates professional narrated product demo videos from any live website URL. Users provide a URL and a prompt, and Reveel's 6-agent pipeline — powered by **Gemini 2.0 Flash** on **Google Cloud Run** — analyzes the site, writes a persona-targeted narration script, records live browser interactions with Playwright, synthesizes voiceover audio, and assembles a polished MP4 video with perfectly synchronized audio and video.

## Features & Functionality

### Core Video Generation (Multimodal + Agentic)
- **URL Analysis**: Gemini 2.0 Flash analyzes any website to understand its product, features, and optimal navigation flow
- **Script Generation**: AI writes a multi-paragraph professional narration script, tailored to personas (Product Manager, Sales Rep, Developer, New User)
- **Browser Recording**: Playwright automates real browser interactions with cinematic mouse movements, click highlights, and typing animations
- **Voiceover Synthesis**: Google TTS generates natural-sounding narration; FFprobe measures exact audio duration
- **Audio-Paced Recording**: Browser actions are precisely timed to match the voiceover — no manual editing needed
- **Video Assembly**: FFmpeg normalizes audio (MP3 → AAC), merges with video, and encodes the final MP4
- **Cloud Storage**: Final videos upload to Firebase Storage (Google Cloud Storage) with public URLs

### Platform Features
- **Google Sign-In** via Firebase Auth
- **Admin Dashboard** with user management, demo approval, and analytics
- **Real-time Progress** updates streamed through Firestore
- **Multi-language** support (English, Spanish, French, German)
- **Rate Limiting** and duration caps for fair usage
- **Download MP4** and share links

## Technologies Used

| Category | Technology | Purpose |
|----------|-----------|---------|
| **AI/ML** | Gemini 2.0 Flash (`@google/genai` SDK) | URL analysis, navigation planning, script generation |
| **Frontend** | Next.js 16, React 19, Tailwind CSS 4, Framer Motion | Premium responsive SaaS dashboard |
| **Backend** | Next.js API Routes (Node.js) | Server-side demo pipeline execution |
| **Browser Automation** | Playwright 1.58.2 (Chromium) | Headless browser recording with visual effects |
| **Audio** | Google TTS API (`google-tts-api`), FFprobe | Voiceover synthesis and duration measurement |
| **Video** | FFmpeg | Audio normalization, video encoding, merge |
| **Auth** | Firebase Authentication | Google Sign-In, session management |
| **Database** | Cloud Firestore | Demo metadata, real-time status, user profiles |
| **Storage** | Firebase Storage (Google Cloud Storage) | Video and thumbnail hosting |
| **Deployment** | Google Cloud Run + Cloud Build | Dockerized container with Chromium + FFmpeg |
| **Container** | Docker (Playwright Jammy base) | Single container for browser + video processing |

## Data Sources
- **Live Websites**: The primary input — Reveel navigates and records real websites in real-time
- **Gemini 2.0 Flash**: Google's multimodal AI model for site analysis and script generation
- **Google Translate TTS**: Text-to-speech engine for voiceover audio synthesis

## Findings & Learnings

1. **Audio/Video Sync Requires Exact Timing**: The most challenging problem was synchronizing voiceover with browser actions. Estimated durations from AI were unreliable. The solution: generate audio first, measure exact duration with `ffprobe`, then pace Playwright actions to fill that exact millisecond window.

2. **Concatenated MP3 Needs Normalization**: Google TTS returns base64-encoded MP3 chunks. Concatenating raw MP3 buffers creates files with inconsistent frame headers. FFmpeg's `filter_complex` silently drops malformed audio. The fix: a two-pass approach — first normalize to clean AAC, then merge with video.

3. **AI CSS Selectors Are Unreliable**: Gemini generates navigation targets as text descriptions ("Book Now") rather than CSS selectors ("#book-btn"). We built a multi-strategy locator that tries `getByRole` → `getByText` → `getByPlaceholder` → CSS selector to reliably find elements.

4. **Cloud Run CPU Throttling Kills Background Processes**: By default, Cloud Run throttles CPU between requests. This terminates Playwright mid-recording. The `--no-cpu-throttling` flag is essential for long-running video generation tasks.

5. **State Serialization Between Pipeline Phases**: Our two-phase flow (analyze → user approval → generate) requires serializing the full pipeline state to disk and reconstructing it in Phase 2, with careful attention to temporary file paths that must survive across phases.

6. **Docker Image Size Matters**: The Playwright base image with Chromium dependencies is ~1.5GB. Adding FFmpeg and npm packages brings the total to ~2GB. Cloud Build's `e2-highcpu-8` machine type cuts build time from 10+ minutes to ~3 minutes.
