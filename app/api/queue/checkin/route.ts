import { NextRequest } from "next/server";
import { ok, err, handleApiError } from "@/lib/utils/api-helpers";
import { checkIn } from "@/lib/services/queue.service";

export async function POST(req: NextRequest) {
  try {
    const { queueCode, sessionToken } = await req.json();
    if (!queueCode || !sessionToken) return err("queueCode and sessionToken are required");
    const entry = await checkIn(queueCode, sessionToken);
    return ok(entry);
  } catch (e) { return handleApiError(e); }
}
