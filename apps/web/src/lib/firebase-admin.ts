import { initializeApp, getApps, cert, getApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { getAuth } from "firebase-admin/auth";

function initAdmin() {
    if (getApps().length === 0) {
        try {
            const serviceAccount = process.env.GOOGLE_APPLICATION_CREDENTIALS;

            if (serviceAccount) {
                let credentialObj;
                try {
                    credentialObj = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON ? 
                        JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) : null;
                } catch (e) {}

                initializeApp({
                    credential: credentialObj ? cert(credentialObj) : cert(serviceAccount),
                    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
                });
            } else {
                initializeApp({
                    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
                });
            }
        } catch (error) {
            console.warn("[Firebase Admin] Initialization failed (expected during build):", error);
            // Crucial: we MUST initialize the default app (no second argument)
            // so that getFirestore() and getAuth() later in the file don't crash
            initializeApp({
                projectId: "demo-project-build"
            });
        }
    }
    return getApp();
}

const app = initAdmin();

export const adminDb = getFirestore(app);
export const adminStorage = getStorage(app);
export const adminAuth = getAuth(app);
