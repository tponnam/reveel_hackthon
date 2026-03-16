/**
 * Reveel AI — Local Video Serving API
 *
 * Serves generated demo videos from the local /tmp directory.
 * This is a fallback when Firebase Storage is not configured.
 *
 * GET /api/videos/{demoId}/demo.mp4
 * GET /api/videos/{demoId}/thumbnail.png
 */

import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const resolvedParams = await params;
    const filePath = resolvedParams.path.join("/");
    const tempDir = process.env.TEMP_DIR || "/tmp/demoforge";
    const fullPath = path.join(tempDir, filePath);

    // Security: prevent path traversal
    const normalized = path.resolve(fullPath);
    if (!normalized.startsWith(path.resolve(tempDir))) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!fs.existsSync(normalized)) {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const ext = path.extname(normalized).toLowerCase();
    const mimeTypes: Record<string, string> = {
        ".mp4": "video/mp4",
        ".webm": "video/webm",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".wav": "audio/wav",
    };
    const contentType = mimeTypes[ext] || "application/octet-stream";

    const stat = fs.statSync(normalized);
    const fileBuffer = fs.readFileSync(normalized);

    return new NextResponse(fileBuffer, {
        headers: {
            "Content-Type": contentType,
            "Content-Length": stat.size.toString(),
            "Cache-Control": "public, max-age=3600",
            "Accept-Ranges": "bytes",
        },
    });
}
