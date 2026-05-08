import { NextRequest } from "next/server";
import { ok, err, handleApiError } from "@/lib/utils/api-helpers";
import { verifyAuth } from "@/lib/utils/auth";
import { completeSession } from "@/lib/services/queue.service";
import { addStamp } from "@/lib/services/rewards.service";
import { notifySessionCompleted, notifyRewardUnlocked } from "@/lib/services/notification.service";

export async function POST(req: NextRequest) {
  try {
    // Barber-only action — could add barber role check here
    await verifyAuth(req);
    const { entryId } = await req.json();
    if (!entryId) return err("entryId is required");

    const entry = await completeSession(entryId);

    // Add stamp and check rewards
    const { stamps, newRewards } = await addStamp(entry.userId, entryId).catch(() => ({
      stamps: 0, totalStamps: 0, newRewards: [],
    }));

    // Notify user
    notifySessionCompleted({
      userId: entry.userId, phone: entry.userPhone, name: entry.userName,
      stamps: String(stamps),
      rewardMessage: newRewards[0] ? `🎁 You earned: ${newRewards[0].type === "FREE_CAP" ? "Free Cap" : "Free Haircut"}!` : undefined,
    }).catch(console.error);

    // Notify reward unlock
    for (const reward of newRewards) {
      notifyRewardUnlocked({
        userId: entry.userId, phone: entry.userPhone, name: entry.userName,
        reward: reward.type === "FREE_CAP" ? "Free Cap" : "Free Haircut",
        rewardId: reward.id,
      }).catch(console.error);
    }

    return ok({ entry, stamps, newRewards });
  } catch (e) { return handleApiError(e); }
}
