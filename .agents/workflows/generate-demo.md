---
description: How to generate a demo video using the DemoForge AI agent pipeline
---

# Generate Demo Workflow

This workflow describes how to generate an AI-powered demo video from a product URL.

## Prerequisites
- Python 3.12+ with packages from `packages/agents/requirements.txt` installed
- Playwright browsers installed: `playwright install chromium`
- Google API key set in environment: `GOOGLE_API_KEY`
- Google Cloud project with TTS API enabled
- `GOOGLE_APPLICATION_CREDENTIALS` pointing to service account JSON

## Steps

1. Set environment variables:
```bash
export GOOGLE_API_KEY="your-gemini-api-key"
export GCP_PROJECT_ID="your-project-id"
```

2. Install Python dependencies:
// turbo
```bash
pip install -r packages/agents/requirements.txt
```

3. Install Playwright browsers:
// turbo
```bash
playwright install chromium
```

4. Run the agent pipeline:
```bash
cd packages/agents && python -m orchestrator.agent "https://example.com" "Navigate the homepage and show key features"
```

5. Check output in `/tmp/demoforge/<demo-id>/`:
   - `screenshots/` — captured UI screenshots
   - `audio/` — voiceover audio segments
   - `captions.srt` — subtitle file
   - `edited_demo.mp4` — edited video
   - `branded_demo.mp4` — branded final video
   - `metadata.json` — full pipeline metadata

## Troubleshooting
- If browser agent fails, ensure Playwright is installed: `playwright install`
- If TTS fails, verify Google Cloud credentials and TTS API is enabled
- For auth-protected URLs, pass staging credentials via the prompt
