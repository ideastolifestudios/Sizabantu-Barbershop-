import { NextRequest } from "next/server";
import { ok, handleApiError } from "@/lib/utils/api-helpers";
import { verifyAuth } from "@/lib/utils/auth";
import { getUserRewards } from "@/lib/services/rewards.service";

export async function GET(req: NextRequest) {
  try {
    const { uid } = await verifyAuth(req);
    const ledger = await getUserRewards(uid);
    return ok(ledger);
  } catch (e) { return handleApiError(e); }
}
