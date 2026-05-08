import { NextRequest } from "next/server";
import { ok, handleApiError } from "@/lib/utils/api-helpers";
import { verifyAuth } from "@/lib/utils/auth";
import { getQueueStatus, getActiveQueue } from "@/lib/services/queue.service";

export async function GET(req: NextRequest) {
  try {
    const { uid } = await verifyAuth(req);
    const { searchParams } = new URL(req.url);
    const all = searchParams.get("all") === "true";

    if (all) {
      // Return full active queue (for barber dashboard)
      const queue = await getActiveQueue();
      return ok(queue);
    }

    const entry = await getQueueStatus(uid);
    return ok(entry);
  } catch (e) { return handleApiError(e); }
}
