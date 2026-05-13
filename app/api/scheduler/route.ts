import { NextRequest } from "next/server";
import { ok, err, handleApiError } from "@/lib/utils/api-helpers";
import { verifySchedulerSecret } from "@/lib/utils/auth";
import { expireStaleBookings } from "@/lib/services/booking.service";
import {
  expireStaleQueueEntries,
  autoAssignBarber,
  notifyNextInQueue,
} from "@/lib/services/queue.service";
import { adminDb, COLLECTIONS } from "@/lib/firebase/admin";
import { sendNotification } from "@/lib/services/notification.service";
import type { Booking, QueueEntry } from "@/lib/types";

// POST /api/scheduler?job=expire     → expire stale bookings + queue entries
// POST /api/scheduler?job=reminders  → send 10-min appointment reminders
// GET  /api/scheduler?job=expire|reminders → same (for Vercel Cron GET requests)

async function runExpire() {
  const [expiredBookings, expiredQueue] = await Promise.all([
    expireStaleBookings(),
    expireStaleQueueEntries(),
  ]);

  const assigned = await autoAssignBarber().catch(() => null);

  let nextNotified = null;
  if (expiredQueue > 0) {
    const next = await notifyNextInQueue();
    if (next) {
      await sendNotification({
        userId: next.userId, phone: next.userPhone, event: "next_up",
        templateData: { code: next.queueCode, token: next.sessionToken },
      }).catch(console.error);
      nextNotified = next.id;
    }
  }

  return { expiredBookings, expiredQueue, assigned, nextNotified };
}

async function runReminders() {
  const now = new Date();
  const targetDate = now.toISOString().split("T")[0];
  const targetMin = now.getMinutes() + 10;
  const targetHour = now.getHours() + Math.floor(targetMin / 60);
  const targetTime = `${String(targetHour).padStart(2, "0")}:${String(targetMin % 60).padStart(2, "0")}`;

  const snap = await adminDb.collection(COLLECTIONS.BOOKINGS)
    .where("date", "==", targetDate)
    .where("startTime", "==", targetTime)
    .where("status", "in", ["confirmed", "checked-in"])
    .get();

  const sent: string[] = [];
  await Promise.all(snap.docs.map(async (doc) => {
    const b = doc.data() as Booking;
    await sendNotification({
      userId: b.userId, phone: b.userPhone, event: "reminder_10min",
      templateData: { service: b.serviceName, time: b.startTime, date: b.date },
    });
    sent.push(doc.id);
  }));

  return { sent, count: sent.length };
}

async function handle(req: NextRequest) {
  verifySchedulerSecret(req);

  const { searchParams } = new URL(req.url);
  const job = searchParams.get("job");

  if (job === "expire") return ok(await runExpire());
  if (job === "reminders") return ok(await runReminders());

  // No job param — run both (useful for a single cron that covers everything)
  const [expire, reminders] = await Promise.all([runExpire(), runReminders()]);
  return ok({ expire, reminders });
}

export async function POST(req: NextRequest) {
  try { return await handle(req); } catch (e) { return handleApiError(e); }
}

// GET support — Vercel Cron sends GET by default
export async function GET(req: NextRequest) {
  try { return await handle(req); } catch (e) { return handleApiError(e); }
}
