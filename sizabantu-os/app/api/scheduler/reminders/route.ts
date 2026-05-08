import { NextRequest } from "next/server";
import { ok, handleApiError } from "@/lib/utils/api-helpers";
import { verifySchedulerSecret } from "@/lib/utils/auth";
import { adminDb, COLLECTIONS } from "@/lib/firebase/admin";
import { sendNotification } from "@/lib/services/notification.service";
import type { Booking } from "@/lib/types";

// Call this route every 5 minutes via Vercel Cron or external cron service
// Add to vercel.json: { "crons": [{ "path": "/api/scheduler/reminders", "schedule": "*/5 * * * *" }] }
export async function POST(req: NextRequest) {
  try {
    verifySchedulerSecret(req);

    const now = new Date();
    const targetDate = now.toISOString().split("T")[0];
    const targetHour = now.getHours();
    const targetMin = now.getMinutes() + 10; // 10 min from now
    const targetTime = `${String(targetHour + Math.floor(targetMin / 60)).padStart(2, "0")}:${String(targetMin % 60).padStart(2, "0")}`;

    const snap = await adminDb.collection(COLLECTIONS.BOOKINGS)
      .where("date", "==", targetDate)
      .where("startTime", "==", targetTime)
      .where("status", "in", ["confirmed", "checked-in"])
      .get();

    const sent: string[] = [];
    const promises = snap.docs.map(async (doc) => {
      const b = doc.data() as Booking;
      await sendNotification({
        userId: b.userId, phone: b.userPhone, event: "reminder_10min",
        templateData: { service: b.serviceName, time: b.startTime, date: b.date },
      });
      sent.push(doc.id);
    });

    await Promise.allSettled(promises);
    return ok({ remindersSet: sent.length, bookingIds: sent });
  } catch (e) { return handleApiError(e); }
}

export async function GET(req: NextRequest) { return POST(req); } // Vercel cron uses GET
