# 🎬 Reveel AI — Autonomous Product Demo Video Generator

> _Turn any website URL into a professional, narrated product demo video in under 2 minutes — powered by a multi-agent AI pipeline running entirely on Google Cloud._

Reveel AI is a fully autonomous, multi-agent AI system that analyzes any live website to understand product features, generates a professional narration script, records real-time browser interactions, and assembles a synchronized video with voiceover.

---

## 🏗️ Project Structure

- **`apps/web`**: Next.js 16 Web Application (UI + API Orchestrator)
- **`packages/agents`**: Python-based AI agents using Google ADK patterns
- **`packages/core`**: Shared utilities and types
- **`hack_fest`**: Hackathon submission materials, demo recordings, and assets

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20+
- **Python** 3.10+
- **FFmpeg** installed on your system
- **Google Cloud CLI** (for deployment)
- **Google AI API Key** (for Gemini)

---

## 🌐 Running the Web Application

The web application handles the user dashboard, demo status tracking, and triggering the generation pipeline.

1. **Navigate to the web app directory**:
   ```bash
   cd apps/web
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up your environment**:
   Create a `.env.local` file with your Firebase and Google AI credentials (see `apps/web/.env.example` if available).

4. **Install Playwright browsers**:
   ```bash
   npx playwright install chromium
   ```

5. **Run the development server**:
   ```bash
   npm run dev
   ```

The app will be available at `http://localhost:3000`.

---

## 🤖 Running the AI Agents (Python)

The core logical agents can be run independently for testing or as part of the background worker.

1. **Navigate to the agents directory**:
   ```bash
   cd packages/agents
   ```

2. **Set up a virtual environment (recommended)**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # macOS/Linux
   # or
   .\venv\Scripts\activate     # Windows
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   playwright install chromium
   ```

4. **Run the Orchestrator**:
   You can run a full demo generation pipeline from the command line:
   ```bash
   python -m orchestrator.agent "https://www.apple.com/mac-mini/" "Create a high-energy tech explainer"
   ```

---

## ☁️ Deployment

The application is designed to run on **Google Cloud Run**.

1. **Build the container**:
   ```bash
   gcloud builds submit --tag gcr.io/YOUR_PROJECT/reveel-backend
   ```

2. **Deploy to Cloud Run**:
   ```bash
   gcloud run deploy reveel-backend \
     --image gcr.io/YOUR_PROJECT/reveel-backend \
     --memory 2Gi \
     --cpu 2 \
     --no-cpu-throttling
   ```

---

## 📄 License

Built for the **2026 Google AI Hackathon**.
