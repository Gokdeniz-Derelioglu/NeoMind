// src/firebase.ts
import * as admin from "firebase-admin";
import * as path from "path";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(
      path.resolve(__dirname, "serviceAccountKey.json")
    ),
  });
}

export const firestore = admin.firestore();
export default admin;
