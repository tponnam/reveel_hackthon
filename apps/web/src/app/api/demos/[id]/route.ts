import { NextRequest, NextResponse } from "next/server";
import { adminDb as db, adminStorage as storage } from "@/lib/firebase-admin";
import fs from "fs";
import path from "path";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    // ... we don't need this GET for now since we use client SDK for fetching ... 
    try {
        const { id } = await params;
        return NextResponse.json({
            id,
            status: "pending",
            progress: 0,
            message: "Demo status endpoint - connect to Firestore in production",
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Demo not found" },
            { status: 404 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json({ error: "Missing ID" }, { status: 400 });
        }

        // 1. Delete Firestore Document
        await db.collection("demos").doc(id).delete();

        // 2. Delete from Cloud Storage (if configured)
        try {
            if (storage) {
                const bucket = storage.bucket();
                // Delete everything under demos/id/
                await bucket.deleteFiles({ prefix: `demos/${id}/` });
            }
        } catch (storageErr) {
            console.warn(`[API /demos/${id}] Storage deletion error:`, storageErr);
            // Non-fatal, keep going
        }

        // 3. Delete from Local Temp (if it exists)
        try {
            const workDir = path.join(process.env.TEMP_DIR || "/tmp/reveel", id);
            if (fs.existsSync(workDir)) {
                fs.rmSync(workDir, { recursive: true, force: true });
            }
        } catch (fsErr) {
            console.warn(`[API /demos/${id}] Local FS deletion error:`, fsErr);
            // Non-fatal
        }

        return NextResponse.json({ id, deleted: true });
    } catch (error: any) {
        console.error(`[API /demos/DELETE] Error:`, error);
        return NextResponse.json(
            { error: error.message || "Delete failed" },
            { status: 500 }
        );
    }
}
