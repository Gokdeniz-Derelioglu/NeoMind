// firebase.ts
import admin from "firebase-admin";

// Prevent re-initializing when hot-reloading
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(), 
    // or use serviceAccount if running locally with JSON
  });
}

// This is the Firestore instance (your "db")
export const firestore = admin.firestore();
