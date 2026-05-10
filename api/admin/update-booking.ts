// POST /api/admin/update-booking
// Admin-only endpoint with server-side role verification + state transition validation.

import { admin, db } from "../_lib/firebase.js";

// Valid lifecycle transitions
const TRANSITIONS: Record<string, string[]> = {
  pending:       ["confirmed", "cancelled"],
  confirmed:     ["checked-in", "expired", "cancelled"],
  "checked-in":  ["in-progress", "cancelled"],
  "in-progress": ["completed", "cancelled"],
  completed:     [],
  expired:       ["confirmed"],
  cancelled:     [],
};

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const authHeader = req.headers.authorization ?? "";
  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  let decoded: admin.auth.DecodedIdToken;
  try {
    decoded = await admin.auth().verifyIdToken(authHeader.replace("Bearer ", ""));
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }

  // Server-side admin check via Custom Claims
  const isAdmin =
    decoded.role === "admin" ||
    decoded.email === "cbrprints22@gmail.com" ||
    (decoded.email && decoded.email.endsWith("@sizabantubarbershop.co.za"));

  if (!isAdmin) {
    return res.status(403).json({ error: "Admin access required" });
  }

  const { bookingId, status } = req.body ?? {};

  if (!bookingId) return res.status(400).json({ error: "bookingId required" });
  if (!status) return res.status(400).json({ error: "status required" });

  try {
    const bookingRef = db.collection("bookings").doc(bookingId);
    
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(bookingRef);
      if (!snap.exists) throw new Error("Booking not found");

      const current = snap.data()!;
      const allowed = TRANSITIONS[current.status] ?? [];

      if (!allowed.includes(status)) {
        throw new Error(`INVALID_TRANSITION: Cannot move from '${current.status}' → '${status}'`);
      }

      const now = admin.firestore.FieldValue.serverTimestamp();
      const updates: Record<string, any> = { status, updatedAt: now };

      // Timestamp specific transitions
      if (status === "checked-in") updates.checkedInAt = now;
      if (status === "in-progress") updates.startedAt = now;
      if (status === "completed") {
        updates.completedAt = now;
        // Trigger rewards via separate Firestore write (handled by rewards function)
        await processReward(tx, current.userId, bookingId);
      }

      tx.update(bookingRef, updates);

      // Write notification for user
      const notifRef = db.collection("notifications").doc();
      const messages: Record<string, string> = {
        "checked-in":  "You have been checked in! Your session starts soon.",
        "in-progress": "Your session has started. Enjoy!",
        completed:     "Session complete! Thank you for visiting Sizabantu.",
        expired:       "Your booking expired. Please rebook.",
        cancelled:     "Your booking has been cancelled.",
      };
      if (messages[status]) {
        tx.set(notifRef, {
          userId: current.userId,
          type: `booking_${status}`,
          message: messages[status],
          bookingId,
          read: false,
          createdAt: now,
        });
      }
    });

    res.json({ success: true, bookingId, status });

  } catch (err: any) {
    if (err.message?.startsWith("INVALID_TRANSITION")) {
      return res.status(422).json({ error: err.message.replace("INVALID_TRANSITION: ", "") });
    }
    console.error("[Admin Update Booking]", err);
    res.status(500).json({ error: (err as Error).message });
  }
}

async function processReward(
  tx: admin.firestore.Transaction,
  userId: string,
  bookingId: string
) {
  const userRef = db.collection("users").doc(userId);
  const userSnap = await tx.get(userRef);
  if (!userSnap.exists) return;

  const userData = userSnap.data()!;

  // Idempotency: skip if this booking was already rewarded
  if (userData.lastRewardedBookingId === bookingId) return;

  const newStamps = (userData.stamps || 0) + 1;
  const rewards = [...(userData.rewardsUnlocked || [])];

  if (newStamps === 5 && !rewards.includes("free_cap")) rewards.push("free_cap");
  if (newStamps >= 10 && !rewards.includes("free_haircut")) rewards.push("free_haircut");

  tx.update(userRef, {
    stamps: admin.firestore.FieldValue.increment(1),
    rewardsUnlocked: rewards,
    lastRewardedBookingId: bookingId,
    totalVisits: admin.firestore.FieldValue.increment(1),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}
