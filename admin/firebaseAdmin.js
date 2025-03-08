// lib/firebaseAdmin.js
import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    // or use admin.credential.cert(serviceAccount) if you have service account credentials
  });
}

const db = admin.firestore();
export { db };
