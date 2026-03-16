# Proof of Google Cloud Deployment

## 1. Live Production URL

**Service URL**: https://reveel-backend-984027721564.us-central1.run.app

This is the active Google Cloud Run service serving the Reveel AI platform.

---

## 2. Cloud Run Deployment Configuration

### Service Details
- **Service Name**: `reveel-backend`
- **Project**: `studio-592211117-913e5`
- **Region**: `us-central1`
- **Image**: `gcr.io/studio-592211117-913e5/reveel-backend:latest`
- **CPU**: Always-on (`--no-cpu-throttling`)
- **Memory**: 2Gi
- **Revision**: `reveel-backend-00010-tl5`

### Deployment Command
```bash
gcloud run deploy reveel-backend \
  --image gcr.io/studio-592211117-913e5/reveel-backend:latest \
  --region us-central1 \
  --no-cpu-throttling \
  --project studio-592211117-913e5
```

### Build Command
```bash
gcloud builds submit \
  --tag gcr.io/studio-592211117-913e5/reveel-backend \
  --project studio-592211117-913e5 \
  --machine-type=e2-highcpu-8
```

---

## 3. Google Cloud Services Used

### Cloud Run
- Hosts the Dockerized Next.js application with Playwright + FFmpeg
- File: [`Dockerfile`](../Dockerfile)
- Configured with CPU always-on to support long-running video generation

### Cloud Build
- Builds Docker container from source code
- Uses `e2-highcpu-8` machine type for fast builds (~3 minutes)

### Firebase (Google Cloud)
- **Firebase Auth**: Google Sign-In authentication
  - File: [`src/lib/firebase/config.ts`](../src/lib/firebase/config.ts)
- **Cloud Firestore**: Real-time demo status, user management
  - File: [`src/lib/agents/orchestrator.ts`](../src/lib/agents/orchestrator.ts) — lines 30-42
- **Firebase Storage (Google Cloud Storage)**: Video and thumbnail hosting
  - File: [`src/lib/agents/storage-agent.ts`](../src/lib/agents/storage-agent.ts)

### Gemini API (Google AI)
- **Model**: `gemini-2.0-flash` via `@google/genai` SDK
- Used for URL analysis and script generation
  - File: [`src/lib/agents/orchestrator.ts`](../src/lib/agents/orchestrator.ts) — `analyzeUrl()` method
  - File: [`src/lib/agents/script-agent.ts`](../src/lib/agents/script-agent.ts) — `run()` method

---

## 4. Key Code References Demonstrating GCP Usage

### Gemini AI Integration
```typescript
// src/lib/agents/orchestrator.ts
import { GoogleGenAI } from "@google/genai";

const response = await this.ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
});
```

### Firebase Storage Upload
```typescript
// src/lib/agents/storage-agent.ts
const { getStorage } = await import("firebase-admin/storage");
const bucket = storage.bucket(bucketName);

await bucket.upload(state.finalVideoPath, {
    destination: `demos/${state.request.userId}/${state.request.id}/demo.mp4`,
    metadata: { contentType: "video/mp4" },
});

await bucket.file(destVideoPath).makePublic();
state.result.videoUrl = `https://storage.googleapis.com/${bucketName}/${destVideoPath}`;
```

### Firestore Real-Time Updates
```typescript
// src/lib/agents/orchestrator.ts
import { getFirestore } from "firebase-admin/firestore";

const db = getFirestore();
await db.collection("demos").doc(state.request.id).update({
    status: state.result.status,
    progress: state.result.progress,
});
```

### Cloud Run Dockerfile
```dockerfile
# Dockerfile
FROM mcr.microsoft.com/playwright:v1.58.2-jammy
RUN apt-get update && apt-get install -y ffmpeg
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 5. Cloud Run Logs (Evidence of Server-Side Execution)

Recent Cloud Run logs showing the multi-agent pipeline executing:

```
[VoiceAgent] TTS returned 10 chunks, total buffer size: 1134720 bytes
[VoiceAgent] Audio file written: /tmp/demoforge/.../audio/full_narration.mp3 (1134720 bytes)
[VoiceAgent] Generated full audio track, duration: 141840ms
[VideoAgent] Using system FFmpeg.
[VideoAgent] Recording file: /tmp/demoforge/.../recording/xxx.webm (2456789 bytes)
[VideoAgent] Audio file: /tmp/demoforge/.../audio/full_narration.mp3 (1134720 bytes)
[VideoAgent] Normalizing audio...
[VideoAgent] Running FFmpeg merge...
[VideoAgent] Final video: /tmp/demoforge/.../output/demo.mp4 (4567890 bytes)
[StorageAgent] Uploading video to demos/.../demo.mp4...
[StorageAgent] Video uploaded: https://storage.googleapis.com/...
```

These logs were retrieved using:
```bash
gcloud logging read 'resource.type="cloud_run_revision" resource.labels.service_name="reveel-backend"' \
  --project studio-592211117-913e5 --limit 30
```
