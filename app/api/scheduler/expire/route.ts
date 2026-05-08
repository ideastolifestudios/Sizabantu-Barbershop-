import { NextRequest } from "next/server";
import { ok, handleApiError } from "@/lib/utils/api-helpers";
import { verifySchedulerSecret } from "@/lib/utils/auth";
import { expireStaleBookings } from "@/lib/services/booking.service";
import { expireStaleQueueEntries, autoAssignBarber, notifyNextInQueue } from "@/lib/services/queue.service";
import { adminDb, COLLECTIONS } from "@/lib/firebase/admin";
import { sendNotification } from "@/lib/services/notification.service";
import type { QueueEntry } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    verifySchedulerSecret(req);

    const [expiredBookings, expiredQueue] = await Promise.all([
      expireStaleBookings(),
      expireStaleQueueEntries(),
    ]);

    // Auto-assign barbers to checked-in customers
    const assigned = await autoAssignBarber().catch(() => null);

    // Notify next in queue if anyone was just expired
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

    return ok({ expiredBookings, expiredQueue, assigned, nextNotified });
  } catch (e) { return handleApiError(e); }
}

export async function GET(req: NextRequest) { return POST(req); } // Vercel cron uses GET
