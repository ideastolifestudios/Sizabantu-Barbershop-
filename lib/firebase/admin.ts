import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

function getAdminApp() {
  if (getApps().length > 0) return getApps()[0];
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is not configured");
  return initializeApp({ credential: cert(JSON.parse(raw)) });
}

// Lazy singletons — deferred until first use so build-time import is safe
let _db: ReturnType<typeof getFirestore> | null = null;
let _auth: ReturnType<typeof getAuth> | null = null;

// Proxy-based exports: existing callers (adminDb.collection(...)) work unchanged
export const adminDb = new Proxy({} as ReturnType<typeof getFirestore>, {
  get(_t, prop, receiver) {
    if (!_db) _db = getFirestore(getAdminApp());
    return Reflect.get(_db, prop, receiver);
  },
});

export const adminAuth = new Proxy({} as ReturnType<typeof getAuth>, {
  get(_t, prop, receiver) {
    if (!_auth) _auth = getAuth(getAdminApp());
    return Reflect.get(_auth, prop, receiver);
  },
});

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
