import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

function getAdminApp() {
  if (getApps().length > 0) return getApps()[0];
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is not configured");
  return initializeApp({ credential: cert(JSON.parse(raw)) });
}

const adminApp = getAdminApp();
export const adminDb = getFirestore(adminApp);
export const adminAuth = getAuth(adminApp);

export const COLLECTIONS = {
  USERS: "users",
  BOOKINGS: "bookings",
  QUEUE: "queue",
  SESSIONS: "sessions",
  NOTIFICATIONS: "notifications",
  REWARDS: "rewards",
  SERVICES: "services",
  BARBERS: "barbers",
} as const;
