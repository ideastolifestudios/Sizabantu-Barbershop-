import { NextRequest } from "next/server";
import { ok, err, handleApiError } from "@/lib/utils/api-helpers";
import { verifyAuth } from "@/lib/utils/auth";
import {
  joinQueue,
  checkIn,
  completeSession,
  processNoShow,
  notifyNextInQueue,
  getQueueStatus,
  getActiveQueue,
} from "@/lib/services/queue.service";
import { addStamp } from "@/lib/services/rewards.service";
import {
  notifyQueueJoined,
  notifySessionCompleted,
  notifyRewardUnlocked,
  sendNotification,
} from "@/lib/services/notification.service";
import { adminDb, COLLECTIONS } from "@/lib/firebase/admin";
import { formatWait } from "@/lib/utils/queue-code";
import type { QueueEntry } from "@/lib/types";

// GET /api/queue                → user's queue status
// GET /api/queue?all=true       → full active queue (barber dashboard)
export async function GET(req: NextRequest) {
  try {
    const { uid } = await verifyAuth(req);
    const { searchParams } = new URL(req.url);
    const all = searchParams.get("all") === "true";

    if (all) {
      const queue = await getActiveQueue();
      return ok(queue);
    }
    const entry = await getQueueStatus(uid);
    return ok(entry);
  } catch (e) {
    return handleApiError(e);
  }
}

// POST /api/queue               → join queue  (action: undefined)
// POST /api/queue?action=checkin   → check in with code+token
// POST /api/queue?action=complete  → barber marks complete
// POST /api/queue?action=noshow    → barber marks no-show
export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");
    const body = await req.json();

    // ── Check-in (replaces /api/queue/checkin) ──────────────────────────────
    if (action === "checkin") {
      const { queueCode, sessionToken } = body;
      if (!queueCode || !sessionToken)
        return err("queueCode and sessionToken are required");
      const entry = await checkIn(queueCode, sessionToken);
      return ok(entry);
    }

    // ── Complete session (replaces /api/queue/complete) ──────────────────────
    if (action === "complete") {
      await verifyAuth(req);
      const { entryId } = body;
      if (!entryId) return err("entryId is required");

      const entry = await completeSession(entryId);

      const { stamps, newRewards } = await addStamp(entry.userId, entryId).catch(
        () => ({ stamps: 0, totalStamps: 0, newRewards: [] })
      );

      notifySessionCompleted({
        userId: entry.userId, phone: entry.userPhone, name: entry.userName,
        stamps: String(stamps),
        rewardMessage: newRewards[0]
          ? `🎁 You earned: ${newRewards[0].type === "FREE_CAP" ? "Free Cap" : "Free Haircut"}!`
          : undefined,
      }).catch(console.error);

      for (const reward of newRewards) {
        notifyRewardUnlocked({
          userId: entry.userId, phone: entry.userPhone, name: entry.userName,
          reward: reward.type === "FREE_CAP" ? "Free Cap" : "Free Haircut",
          rewardId: reward.id,
        }).catch(console.error);
      }

      return ok({ entry, stamps, newRewards });
    }

    // ── No-show (replaces /api/queue/noshow) ────────────────────────────────
    if (action === "noshow") {
      await verifyAuth(req);
      const { entryId } = body;
      if (!entryId) return err("entryId is required");

      const snap = await adminDb.collection(COLLECTIONS.QUEUE).doc(entryId).get();
      const entry = snap.data() as QueueEntry;

      await processNoShow(entryId);

      sendNotification({
        userId: entry.userId, phone: entry.userPhone, event: "no_show",
        templateData: { name: entry.userName, code: entry.queueCode },
      }).catch(console.error);

      const next = await notifyNextInQueue();
      if (next) {
        sendNotification({
          userId: next.userId, phone: next.userPhone, event: "next_up",
          templateData: { code: next.queueCode, token: next.sessionToken },
        }).catch(console.error);
      }

      return ok({ processed: entryId, nextNotified: next?.id || null });
    }

    // ── Join queue (default POST) ────────────────────────────────────────────
    const { uid } = await verifyAuth(req);
    const { userPhone, userName, serviceId, serviceName } = body;
    if (!userPhone || !userName) return err("userPhone and userName are required");

    const entry = await joinQueue({ userId: uid, userPhone, userName, serviceId, serviceName });

    notifyQueueJoined({
      userId: uid, phone: userPhone,
      code: entry.queueCode, position: String(entry.position),
      wait: formatWait(entry.estimatedWaitMinutes), token: entry.sessionToken,
    }).catch(console.error);

    return ok(entry, 201);
  } catch (e) {
    return handleApiError(e);
  }
}
