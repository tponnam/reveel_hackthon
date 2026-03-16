import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import * as fs from "fs";

// Load service account (already in demoforge root downloaded by user)
const serviceAccount = JSON.parse(
    fs.readFileSync("/Users/thulasiramponnam/Downloads/studio-592211117-913e5-firebase-adminsdk-fbsvc-d3e5e49c49.json", "utf8")
);

if (!getApps().length) {
    initializeApp({
        credential: cert(serviceAccount),
    });
}
const db = getFirestore();

async function makeAdmin() {
    const usersSnapshot = await db.collection("users").get();
    
    if (usersSnapshot.empty) {
        console.log("No users found in Firestore. Please login via Google first, then I can run this script!");
        return;
    }

    console.log(`Found ${usersSnapshot.size} user(s). Promoting to admin...`);
    for (const doc of usersSnapshot.docs) {
        const data = doc.data();
        await doc.ref.update({
            role: "admin",
            status: "approved"
        });
        console.log(`Promoted ${data.email || data.name} (uid: ${data.uid}) to admin!`);
    }
}

makeAdmin().then(() => process.exit(0)).catch(e => {
    console.error(e);
    process.exit(1);
});
