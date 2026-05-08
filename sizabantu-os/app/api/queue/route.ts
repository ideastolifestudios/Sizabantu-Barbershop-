import { NextRequest } from "next/server";
import { ok, err, handleApiError } from "@/lib/utils/api-helpers";
import { verifyAuth } from "@/lib/utils/auth";
import { joinQueue } from "@/lib/services/queue.service";
import { notifyQueueJoined } from "@/lib/services/notification.service";
import { formatWait } from "@/lib/utils/queue-code";

export async function POST(req: NextRequest) {
  try {
    const { uid } = await verifyAuth(req);
    const { userPhone, userName, serviceId, serviceName } = await req.json();
    if (!userPhone || !userName) return err("userPhone and userName are required");

    const entry = await joinQueue({ userId: uid, userPhone, userName, serviceId, serviceName });

    notifyQueueJoined({
      userId: uid, phone: userPhone,
      code: entry.queueCode, position: String(entry.position),
      wait: formatWait(entry.estimatedWaitMinutes), token: entry.sessionToken,
    }).catch(console.error);

    return ok(entry, 201);
  } catch (e) { return handleApiError(e); }
}
