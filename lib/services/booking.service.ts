import { adminDb, COLLECTIONS } from "@/lib/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";
import type { Booking, BookingStatus } from "@/lib/types";

const SLOT_MINS = 30;
const OPEN_HOUR = 9;
const CLOSE_HOUR = 18;
const CLOSED_DAYS = [1]; // Monday closed

function allSlots(): string[] {
  const slots: string[] = [];
  for (let h = OPEN_HOUR; h < CLOSE_HOUR; h++) {
    for (let m = 0; m < 60; m += SLOT_MINS) {
      slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  return slots;
}

async function bookedSlots(date: string, barberId: string): Promise<Set<string>> {
  const snap = await adminDb.collection(COLLECTIONS.BOOKINGS)
    .where("date", "==", date)
    .where("barberId", "==", barberId)
    .where("status", "in", ["pending", "confirmed", "checked-in", "in-progress"])
    .get();
  const set = new Set<string>();
  snap.forEach(d => set.add((d.data() as Booking).startTime));
  return set;
}

export async function getAvailableSlots(date: string, barberId: string) {
  const d = new Date(date + "T00:00:00");
  if (CLOSED_DAYS.includes(d.getDay())) return { available: false, reason: "Closed on Mondays", slots: [] };

  const today = new Date().toISOString().split("T")[0];
  const nowH = new Date().getHours(), nowM = new Date().getMinutes();
  const booked = await bookedSlots(date, barberId);

  return {
    available: true,
    slots: allSlots().map(t => {
      const [h, m] = t.split(":").map(Number);
      const past = date === today && (h < nowH || (h === nowH && m <= nowM));
      return { time: t, available: !booked.has(t) && !past };
    }),
  };
}

export async function createBooking(input: {
  userId: string; userPhone: string; userName: string;
  barberId: string; serviceId: string; serviceName: string;
  servicePrice: number; date: string; startTime: string; notes?: string;
}): Promise<Booking> {
  // Prevent double booking for user
  const existing = await adminDb.collection(COLLECTIONS.BOOKINGS)
    .where("userId", "==", input.userId)
    .where("status", "in", ["pending", "confirmed", "checked-in", "in-progress"])
    .limit(1).get();
  if (!existing.empty) throw new Error(`Active booking exists (${existing.docs[0].id}). Cancel it first.`);

  const ref = adminDb.collection(COLLECTIONS.BOOKINGS).doc();
  const [h, m] = input.startTime.split(":").map(Number);
  const endMins = m + SLOT_MINS;
  const endTime = `${String(h + Math.floor(endMins / 60)).padStart(2, "0")}:${String(endMins % 60).padStart(2, "0")}`;

  const booking: Omit<Booking, "id"> = {
    userId: input.userId, userPhone: input.userPhone, userName: input.userName,
    barberId: input.barberId, serviceId: input.serviceId,
    serviceName: input.serviceName, servicePrice: input.servicePrice,
    date: input.date, startTime: input.startTime, endTime,
    status: "confirmed", notes: input.notes,
    createdAt: Timestamp.now(), updatedAt: Timestamp.now(), confirmedAt: Timestamp.now(),
  };

  await adminDb.runTransaction(async tx => {
    const conflict = await tx.get(
      adminDb.collection(COLLECTIONS.BOOKINGS)
        .where("date", "==", input.date).where("barberId", "==", input.barberId)
        .where("startTime", "==", input.startTime)
        .where("status", "in", ["pending", "confirmed", "checked-in", "in-progress"])
    );
    if (!conflict.empty) throw new Error("Slot just taken — please pick another.");
    tx.set(ref, booking);
  });

  return { id: ref.id, ...booking };
}

export async function cancelBooking(id: string, userId: string): Promise<void> {
  const ref = adminDb.collection(COLLECTIONS.BOOKINGS).doc(id);
  const snap = await ref.get();
  if (!snap.exists) throw new Error("Booking not found");
  const b = snap.data() as Booking;
  if (b.userId !== userId) throw new Error("Unauthorized");
  if (["completed", "cancelled", "expired"].includes(b.status))
    throw new Error(`Cannot cancel a ${b.status} booking`);
  await ref.update({ status: "cancelled" as BookingStatus, updatedAt: Timestamp.now() });
}

export async function getUserBookings(userId: string): Promise<Booking[]> {
  const snap = await adminDb.collection(COLLECTIONS.BOOKINGS)
    .where("userId", "==", userId).orderBy("createdAt", "desc").limit(20).get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Booking));
}

export async function getBookingById(id: string): Promise<Booking> {
  const snap = await adminDb.collection(COLLECTIONS.BOOKINGS).doc(id).get();
  if (!snap.exists) throw new Error("Booking not found");
  return { id: snap.id, ...snap.data() } as Booking;
}

export async function checkInBooking(id: string, userId: string): Promise<Booking> {
  const ref = adminDb.collection(COLLECTIONS.BOOKINGS).doc(id);
  const snap = await ref.get();
  if (!snap.exists) throw new Error("Booking not found");
  const b = snap.data() as Booking;
  if (b.userId !== userId) throw new Error("Unauthorized");
  if (b.status !== "confirmed") throw new Error(`Cannot check-in: status is ${b.status}`);
  await ref.update({ status: "checked-in", updatedAt: Timestamp.now() });
  return { id, ...b, status: "checked-in" };
}

export async function expireStaleBookings(): Promise<number> {
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const snap = await adminDb.collection(COLLECTIONS.BOOKINGS)
    .where("status", "in", ["pending", "confirmed"]).where("date", "<=", today).get();
  const batch = adminDb.batch();
  let n = 0;
  snap.forEach(doc => {
    const b = doc.data() as Booking;
    if (b.date < today || (b.date === today && b.startTime < currentTime)) {
      batch.update(doc.ref, { status: "expired", updatedAt: Timestamp.now() });
      n++;
    }
  });
  if (n) await batch.commit();
  return n;
}
