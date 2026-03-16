/**
 * Reveel AI — Storage Agent
 *
 * Handles persisting generated video and thumbnail files so the
 * frontend can access them.
 *
 * Strategy:
 * 1. Try uploading to Firebase Storage (cloud) → returns public HTTPS URLs
 * 2. If that fails or isn't configured, fall back to local API serving
 *    via /api/videos/[demoId]/demo.mp4
 */
import fs from "fs";
import path from "path";
import type { PipelineState } from "./types";

export class StorageAgent {
    async run(state: PipelineState): Promise<PipelineState> {
        const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET;

        // Try Firebase Storage upload if configured
        if (bucketName) {
            try {
                await this.uploadToFirebaseStorage(state, bucketName);
                return state;
            } catch (err: any) {
                console.warn("[StorageAgent] Firebase Storage upload failed, falling back to local API:", err.message);
            }
        } else {
            console.log("[StorageAgent] Firebase Storage not fully configured. Using local API serving.");
        }

        // Fallback: use local API endpoints to serve the files
        this.setLocalApiUrls(state);

        return state;
    }

    private async uploadToFirebaseStorage(state: PipelineState, bucketName: string): Promise<void> {
        // Dynamic import to avoid crashes when firebase-admin isn't configured
        const { getStorage } = await import("firebase-admin/storage");
        const { getApps, initializeApp } = await import("firebase-admin/app");

        if (getApps().length === 0) {
            initializeApp({
                projectId: process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            });
        }

        const storage = getStorage();
        const bucket = storage.bucket(bucketName);

        // Upload Video
        if (state.finalVideoPath && fs.existsSync(state.finalVideoPath)) {
            const destVideoPath = `demos/${state.request.userId}/${state.request.id}/demo.mp4`;
            console.log(`[StorageAgent] Uploading video to ${destVideoPath}...`);

            await bucket.upload(state.finalVideoPath, {
                destination: destVideoPath,
                metadata: { contentType: "video/mp4" },
            });

            await bucket.file(destVideoPath).makePublic();
            state.result.videoUrl = `https://storage.googleapis.com/${bucketName}/${destVideoPath}`;
            console.log(`[StorageAgent] Video uploaded: ${state.result.videoUrl}`);
        }

        // Upload Thumbnail
        if (state.screenshots?.length > 0 && fs.existsSync(state.screenshots[0])) {
            const destThumbPath = `demos/${state.request.userId}/${state.request.id}/thumbnail.png`;
            console.log(`[StorageAgent] Uploading thumbnail to ${destThumbPath}...`);

            await bucket.upload(state.screenshots[0], {
                destination: destThumbPath,
                metadata: { contentType: "image/png" },
            });

            await bucket.file(destThumbPath).makePublic();
            state.result.thumbnailUrl = `https://storage.googleapis.com/${bucketName}/${destThumbPath}`;
            console.log(`[StorageAgent] Thumbnail uploaded: ${state.result.thumbnailUrl}`);
        }
    }

    /**
     * Sets URLs that point to the local Next.js API route for video serving.
     * These work in development without any cloud storage configuration.
     */
    private setLocalApiUrls(state: PipelineState): void {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";

        if (state.finalVideoPath && fs.existsSync(state.finalVideoPath)) {
            // Convert /tmp/demoforge/DEMO_ID/output/demo.mp4 → /api/videos/DEMO_ID/output/demo.mp4
            const tempDir = process.env.TEMP_DIR || "/tmp/demoforge";
            const relativePath = path.relative(tempDir, state.finalVideoPath);
            state.result.videoUrl = `${appUrl}/api/videos/${relativePath}`;
            console.log(`[StorageAgent] Local video URL: ${state.result.videoUrl}`);
        }

        if (state.screenshots?.length > 0 && fs.existsSync(state.screenshots[0])) {
            const tempDir = process.env.TEMP_DIR || "/tmp/demoforge";
            const relativePath = path.relative(tempDir, state.screenshots[0]);
            state.result.thumbnailUrl = `${appUrl}/api/videos/${relativePath}`;
            console.log(`[StorageAgent] Local thumbnail URL: ${state.result.thumbnailUrl}`);
        }
    }
}
