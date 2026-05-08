import { NextRequest } from "next/server";
import { ok, err, handleApiError } from "@/lib/utils/api-helpers";
import { verifyAuth } from "@/lib/utils/auth";
import { redeemReward } from "@/lib/services/rewards.service";

export async function POST(req: NextRequest) {
  try {
    const { uid } = await verifyAuth(req);
    const { rewardId } = await req.json();
    if (!rewardId) return err("rewardId is required");
    const reward = await redeemReward(rewardId, uid);
    return ok(reward);
  } catch (e) { return handleApiError(e); }
}
