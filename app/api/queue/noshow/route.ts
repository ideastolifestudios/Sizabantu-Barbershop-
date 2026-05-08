import { NextRequest } from "next/server";
import { ok, err, handleApiError } from "@/lib/utils/api-helpers";
import { verifyAuth } from "@/lib/utils/auth";
import { processNoShow, notifyNextInQueue } from "@/lib/services/queue.service";
import { adminDb, COLLECTIONS } from "@/lib/firebase/admin";
import { sendNotification } from "@/lib/services/notification.service";
import type { QueueEntry } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    await verifyAuth(req);
    const { entryId } = await req.json();
    if (!entryId) return err("entryId is required");

    // Get entry for notification before processing
    const snap = await adminDb.collection(COLLECTIONS.QUEUE).doc(entryId).get();
    const entry = snap.data() as QueueEntry;

    await processNoShow(entryId);

    // Notify the no-show user
    sendNotification({
      userId: entry.userId, phone: entry.userPhone, event: "no_show",
      templateData: { name: entry.userName, code: entry.queueCode },
    }).catch(console.error);

    // Notify next person in queue
    const next = await notifyNextInQueue();
    if (next) {
      sendNotification({
        userId: next.userId, phone: next.userPhone, event: "next_up",
        templateData: { code: next.queueCode, token: next.sessionToken },
      }).catch(console.error);
    }

    return ok({ processed: entryId, nextNotified: next?.id || null });
  } catch (e) { return handleApiError(e); }
}
