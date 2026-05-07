// Shared Firebase Admin singleton for all Vercel API routes
// Safe to import from multiple serverless functions — only initializes once per container.

import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";

const PROJECT_ID = "gen-lang-client-0190231678";
const DB_ID = "ai-studio-c134bcfb-4fc5-4078-a8fa-938aaf361a8a";

if (!admin.apps.length) {
  admin.initializeApp({ projectId: PROJECT_ID });
}

export const db = getFirestore(admin.app(), DB_ID);
export { admin };
