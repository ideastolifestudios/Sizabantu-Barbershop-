import { NextRequest } from "next/server";
import { ok, err, handleApiError } from "@/lib/utils/api-helpers";
import { verifyAuth } from "@/lib/utils/auth";
import { getUserRewards, redeemReward } from "@/lib/services/rewards.service";

// GET /api/rewards        → user's reward ledger
// POST /api/rewards       → redeem a reward  { rewardId }
export async function GET(req: NextRequest) {
  try {
    const { uid } = await verifyAuth(req);
    const ledger = await getUserRewards(uid);
    return ok(ledger);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { uid } = await verifyAuth(req);
    const { rewardId } = await req.json();
    if (!rewardId) return err("rewardId is required");
    const reward = await redeemReward(rewardId, uid);
    return ok(reward);
  } catch (e) {
    return handleApiError(e);
  }
}
