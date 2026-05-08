import { NextRequest } from "next/server";
import { ok, handleApiError } from "../../../../lib/utils/api-helpers";
import { verifyAuth } from "../../../../lib/utils/auth";
import { adminDb, COLLECTIONS } from "../../../../lib/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";

// Create or fetch user profile after sign-in
export async function POST(req: NextRequest) {
  try {
    const { uid, email, phone } = await verifyAuth(req);
    const { displayName } = await req.json().catch(() => ({}));

    const ref = adminDb.collection(COLLECTIONS.USERS).doc(uid);
    const snap = await ref.get();

    if (!snap.exists) {
      await ref.set({
        uid, email, phone, displayName,
        stamps: 0, totalStamps: 0, totalVisits: 0,
        noShowCount: 0, optedOutWhatsApp: false,
        joinedAt: Timestamp.now(),
      });
    }

    return ok({ uid, email, phone, displayName, isNew: !snap.exists });
  } catch (e) { return handleApiError(e); }
}
