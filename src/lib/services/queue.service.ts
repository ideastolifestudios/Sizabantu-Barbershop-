import { adminDb, COLLECTIONS } from "@/lib/firebase/admin";
import { Timestamp, FieldValue } from "firebase-admin/firestore";
import type { QueueEntry, QueueStatus, Barber } from "@/lib/types";
import { generateQueueCode, generateSessionToken, estimateWaitMinutes } from "@/lib/utils/queue-code";

const CHECKIN_EXPIRY_MINUTES = 15; // minutes to check in after notification

async function getNextPosition(): Promise<number> {
  const snap = await adminDb.collection(COLLECTIONS.QUEUE)
    .where("status", "in", ["waiting", "notified", "checked-in"])
    .orderBy("joinedAt", "desc").limit(1).get();
  if (snap.empty) return 1;
  return (snap.docs[0].data() as QueueEntry).position + 1;
}

export async function joinQueue(input: {
  userId: string; userPhone: string; userName: string;
  serviceId?: string; serviceName?: string;
}): Promise<QueueEntry> {
  // Check user not already in queue
  const existing = await adminDb.collection(COLLECTIONS.QUEUE)
    .where("userId", "==", input.userId)
    .where("status", "in", ["waiting", "notified", "checked-in", "serving"])
    .limit(1).get();
  if (!existing.empty) throw new Error("You are already in the queue");

  const position = await getNextPosition();
  const ref = adminDb.collection(COLLECTIONS.QUEUE).doc();
  const expiresAt = Timestamp.fromDate(new Date(Date.now() + 3 * 60 * 60 * 1000)); // 3h max queue time

  const entry: Omit<QueueEntry, "id"> = {
    userId: input.userId, userPhone: input.userPhone, userName: input.userName,
    queueCode: generateQueueCode(position), sessionToken: generateSessionToken(),
    serviceId: input.serviceId, serviceName: input.serviceName,
    position, estimatedWaitMinutes: estimateWaitMinutes(position),
    status: "waiting", joinedAt: Timestamp.now(), expiresAt,
  };

  await ref.set(entry);
  return { id: ref.id, ...entry };
}

export async function getQueueStatus(userId: string): Promise<QueueEntry | null> {
  const snap = await adminDb.collection(COLLECTIONS.QUEUE)
    .where("userId", "==", userId)
    .where("status", "in", ["waiting", "notified", "checked-in", "serving"])
    .orderBy("joinedAt", "desc").limit(1).get();
  if (snap.empty) return null;

  const entry = { id: snap.docs[0].id, ...snap.docs[0].data() } as QueueEntry;

  // Recalculate live position
  const ahead = await adminDb.collection(COLLECTIONS.QUEUE)
    .where("status", "in", ["waiting", "notified"])
    .where("joinedAt", "<", entry.joinedAt).get();
  const livePosition = ahead.size + 1;

  return { ...entry, position: livePosition, estimatedWaitMinutes: estimateWaitMinutes(livePosition) };
}

export async function checkIn(queueCode: string, sessionToken: string): Promise<QueueEntry> {
  const snap = await adminDb.collection(COLLECTIONS.QUEUE)
    .where("queueCode", "==", queueCode)
    .where("status", "in", ["waiting", "notified"])
    .limit(1).get();

  if (snap.empty) throw new Error("Queue code not found or already processed");
  const ref = snap.docs[0].ref;
  const entry = { id: snap.docs[0].id, ...snap.docs[0].data() } as QueueEntry;

  if (entry.sessionToken !== sessionToken) throw new Error("Invalid verification token");

  // Check expiry for notified entries
  if (entry.status === "notified" && entry.expiresAt.toDate() < new Date()) {
    await ref.update({ status: "expired", updatedAt: Timestamp.now() });
    throw new Error("Your check-in window has expired. Please rejoin the queue.");
  }

  await ref.update({ status: "checked-in", checkedInAt: Timestamp.now() });
  return { ...entry, status: "checked-in" };
}

export async function startServing(entryId: string, barberId: string): Promise<QueueEntry> {
  const ref = adminDb.collection(COLLECTIONS.QUEUE).doc(entryId);
  const snap = await ref.get();
  if (!snap.exists) throw new Error("Queue entry not found");
  const entry = snap.data() as QueueEntry;
  if (!["checked-in", "waiting", "notified"].includes(entry.status))
    throw new Error(`Cannot serve: status is ${entry.status}`);

  await ref.update({ status: "serving", barberId, servingStartedAt: Timestamp.now() });

  // Mark barber as busy
  await adminDb.collection(COLLECTIONS.BARBERS).doc(barberId)
    .update({ currentQueueEntryId: entryId });

  return { id: entryId, ...entry, status: "serving", barberId };
}

export async function completeSession(entryId: string): Promise<QueueEntry> {
  const ref = adminDb.collection(COLLECTIONS.QUEUE).doc(entryId);
  const snap = await ref.get();
  if (!snap.exists) throw new Error("Queue entry not found");
  const entry = { id: entryId, ...snap.data() } as QueueEntry;
  if (entry.status !== "serving") throw new Error(`Cannot complete: status is ${entry.status}`);

  const batch = adminDb.batch();
  batch.update(ref, { status: "completed", completedAt: Timestamp.now() });

  // Record session
  const sessionRef = adminDb.collection(COLLECTIONS.SESSIONS).doc();
  const startedAt = entry.servingStartedAt || entry.checkedInAt || entry.joinedAt;
  const durationMs = Date.now() - startedAt.toDate().getTime();
  batch.set(sessionRef, {
    queueEntryId: entryId,
    barberId: entry.barberId,
    userId: entry.userId,
    startedAt,
    completedAt: Timestamp.now(),
    durationMinutes: Math.round(durationMs / 60000),
  });

  // Free barber
  if (entry.barberId) {
    batch.update(adminDb.collection(COLLECTIONS.BARBERS).doc(entry.barberId), {
      currentQueueEntryId: null,
      totalServiced: FieldValue.increment(1),
    });
  }

  // Update user visit count
  batch.update(adminDb.collection(COLLECTIONS.USERS).doc(entry.userId), {
    totalVisits: FieldValue.increment(1),
    lastVisitAt: Timestamp.now(),
  });

  await batch.commit();
  return { ...entry, status: "completed" };
}

export async function processNoShow(entryId: string): Promise<void> {
  const ref = adminDb.collection(COLLECTIONS.QUEUE).doc(entryId);
  const snap = await ref.get();
  if (!snap.exists) throw new Error("Queue entry not found");
  const entry = snap.data() as QueueEntry;

  const batch = adminDb.batch();
  batch.update(ref, { status: "expired" });
  batch.update(adminDb.collection(COLLECTIONS.USERS).doc(entry.userId), {
    noShowCount: FieldValue.increment(1),
  });
  await batch.commit();
}

/** Notify the next person in line */
export async function notifyNextInQueue(): Promise<QueueEntry | null> {
  const snap = await adminDb.collection(COLLECTIONS.QUEUE)
    .where("status", "==", "waiting")
    .orderBy("joinedAt", "asc").limit(1).get();
  if (snap.empty) return null;

  const ref = snap.docs[0].ref;
  const entry = { id: snap.docs[0].id, ...snap.docs[0].data() } as QueueEntry;
  const expiresAt = Timestamp.fromDate(new Date(Date.now() + CHECKIN_EXPIRY_MINUTES * 60 * 1000));

  await ref.update({ status: "notified", notifiedAt: Timestamp.now(), expiresAt });
  return { ...entry, status: "notified", expiresAt };
}

/** Get all active queue entries (for barber dashboard) */
export async function getActiveQueue(): Promise<QueueEntry[]> {
  const snap = await adminDb.collection(COLLECTIONS.QUEUE)
    .where("status", "in", ["waiting", "notified", "checked-in", "serving"])
    .orderBy("joinedAt", "asc").get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as QueueEntry));
}

/** Expire queue entries that have timed out */
export async function expireStaleQueueEntries(): Promise<number> {
  const now = Timestamp.now();
  const snap = await adminDb.collection(COLLECTIONS.QUEUE)
    .where("status", "in", ["waiting", "notified"])
    .where("expiresAt", "<=", now).get();

  const batch = adminDb.batch();
  let n = 0;
  snap.forEach(doc => { batch.update(doc.ref, { status: "expired" }); n++; });
  if (n) await batch.commit();
  return n;
}

/** Assign next waiting customer to a free barber */
export async function autoAssignBarber(): Promise<{ entryId: string; barberId: string } | null> {
  const [barbers, queue] = await Promise.all([
    adminDb.collection(COLLECTIONS.BARBERS).where("active", "==", true).get(),
    adminDb.collection(COLLECTIONS.QUEUE).where("status", "==", "checked-in").orderBy("joinedAt").limit(1).get(),
  ]);

  if (queue.empty) return null;

  const freeBarber = barbers.docs.find(d => !(d.data() as Barber).currentQueueEntryId);
  if (!freeBarber) return null;

  const entryDoc = queue.docs[0];
  await startServing(entryDoc.id, freeBarber.id);
  return { entryId: entryDoc.id, barberId: freeBarber.id };
}
