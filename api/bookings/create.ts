// POST /api/bookings/create
// Creates a booking with Firestore transaction (prevents double-booking + race conditions)
// Generates verificationCode and queuePosition atomically.

import { admin, db } from "../_lib/firebase.js";

// Valid services with server-authoritative pricing
const SERVICES: Record<string, { name: string; price: number; durationMins: number }> = {
  fade:    { name: "Fade",              price: 50,  durationMins: 30 },
  brush:   { name: "Brush",             price: 35,  durationMins: 30 },
  combo1:  { name: "Fade & Shape",      price: 90,  durationMins: 45 },
  combo2:  { name: "Cut & Beard",       price: 80,  durationMins: 45 },
  combo3:  { name: "Fade & Wash",       price: 75,  durationMins: 50 },
  combo4:  { name: "Cut & Edge",        price: 75,  durationMins: 45 },
  combo5:  { name: "Cut & Permanent",   price: 110, durationMins: 60 },
};

// Valid status transitions
const VALID_TRANSITIONS: Record<string, string[]> = {
  pending:     ["confirmed", "cancelled"],
  confirmed:   ["checked-in", "expired", "cancelled"],
  "checked-in": ["in-progress", "cancelled"],
  "in-progress": ["completed", "cancelled"],
  completed:   [],
  expired:     ["confirmed"],   // allow rebooking grace
  cancelled:   [],
};

function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function getAtomicQueuePosition(): Promise<number> {
  const today = new Date().toISOString().split("T")[0];
  const counterRef = db.collection("counters").doc("queue");

  return db.runTransaction(async (tx) => {
    const snap = await tx.get(counterRef);
    const data = snap.data() ?? {};
    
    // Reset counter if it's a new day
    if (data.date !== today) {
      tx.set(counterRef, { date: today, dailyCount: 1 });
      return 1;
    }
    
    const next = (data.dailyCount || 0) + 1;
    tx.update(counterRef, { dailyCount: next });
    return next;
  });
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // Verify Firebase Auth token
  const authHeader = req.headers.authorization ?? "";
  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  let decodedToken: admin.auth.DecodedIdToken;
  try {
    decodedToken = await admin.auth().verifyIdToken(authHeader.replace("Bearer ", ""));
  } catch {
    return res.status(401).json({ error: "Invalid auth token" });
  }

  const { type, serviceId, scheduledAt, userName, userEmail } = req.body ?? {};

  // Validate inputs
  if (!type || !["queue", "scheduled"].includes(type)) {
    return res.status(400).json({ error: "type must be 'queue' or 'scheduled'" });
  }
  if (!serviceId || !SERVICES[serviceId]) {
    return res.status(400).json({ error: `Invalid serviceId. Valid: ${Object.keys(SERVICES).join(", ")}` });
  }
  if (type === "scheduled" && !scheduledAt) {
    return res.status(400).json({ error: "scheduledAt required for scheduled bookings" });
  }

  const service = SERVICES[serviceId];
  const userId = decodedToken.uid;

  try {
    // Atomic transaction: check double-booking + create
    const result = await db.runTransaction(async (tx) => {
      // Check for existing active booking
      const existingSnap = await db.collection("bookings")
        .where("userId", "==", userId)
        .where("status", "in", ["pending", "confirmed", "checked-in", "in-progress"])
        .limit(1)
        .get();

      if (!existingSnap.empty) {
        throw new Error("EXISTING_BOOKING: You already have an active booking.");
      }

      // Get queue position for walk-ins
      let queuePosition = 0;
      if (type === "queue") {
        const counterRef = db.collection("counters").doc("queue");
        const counterSnap = await tx.get(counterRef);
        const today = new Date().toISOString().split("T")[0];
        const data = counterSnap.data() ?? {};
        
        if (data.date !== today) {
          queuePosition = 1;
          tx.set(counterRef, { date: today, dailyCount: 1 });
        } else {
          queuePosition = (data.dailyCount || 0) + 1;
          tx.update(counterRef, { dailyCount: queuePosition });
        }
      }

      const verificationCode = generateVerificationCode();
      const now = admin.firestore.FieldValue.serverTimestamp();

      // Calculate expiry for scheduled bookings (scheduledAt + 10 min grace)
      let expiresAt = null;
      if (type === "scheduled" && scheduledAt) {
        const schedDate = new Date(scheduledAt);
        schedDate.setMinutes(schedDate.getMinutes() + 10);
        expiresAt = admin.firestore.Timestamp.fromDate(schedDate);
      }

      const bookingData = {
        userId,
        userName: userName ?? decodedToken.name ?? "Guest",
        userEmail: userEmail ?? decodedToken.email ?? "",
        type,
        serviceId,
        serviceName: service.name,
        totalPaid: service.price,
        durationMins: service.durationMins,
        status: "confirmed",
        verificationCode,
        queuePosition,
        location: "shop",
        scheduledAt: type === "scheduled" ? admin.firestore.Timestamp.fromDate(new Date(scheduledAt)) : now,
        expiresAt,
        checkedInAt: null,
        startedAt: null,
        completedAt: null,
        createdAt: now,
        updatedAt: now,
      };

      const bookingRef = db.collection("bookings").doc();
      tx.set(bookingRef, bookingData);

      // Write notification
      const notifRef = db.collection("notifications").doc();
      tx.set(notifRef, {
        userId,
        type: "booking_confirmed",
        message: `Your ${service.name} is confirmed! Code: ${verificationCode}`,
        bookingId: bookingRef.id,
        read: false,
        createdAt: now,
      });

      return { bookingId: bookingRef.id, verificationCode, queuePosition };
    });

    res.json({
      success: true,
      bookingId: result.bookingId,
      verificationCode: result.verificationCode,
      queuePosition: result.queuePosition,
      message: `Booking confirmed! Your code: ${result.verificationCode}`,
    });

  } catch (err: any) {
    if (err.message?.startsWith("EXISTING_BOOKING")) {
      return res.status(409).json({ error: "You already have an active booking." });
    }
    console.error("[Booking Create]", err);
    res.status(500).json({ error: (err as Error).message });
  }
}
