import { adminDb, COLLECTIONS } from "@/lib/firebase/admin";
import { Timestamp, FieldValue } from "firebase-admin/firestore";
import type { Reward, RewardLedger, RewardType } from "@/lib/types";

const MILESTONES: Array<{ stamps: number; type: RewardType; description: string }> = [
  { stamps: 5,  type: "FREE_CAP",     description: "Free Cap — Claim at the shop!" },
  { stamps: 10, type: "FREE_HAIRCUT", description: "Free Haircut — Next session on us!" },
];

export async function getUserRewards(userId: string): Promise<RewardLedger> {
  const [userSnap, rewardsSnap] = await Promise.all([
    adminDb.collection(COLLECTIONS.USERS).doc(userId).get(),
    adminDb.collection(COLLECTIONS.REWARDS).where("userId", "==", userId)
      .orderBy("earnedAt", "desc").get(),
  ]);

  const user = userSnap.data() || { stamps: 0, totalStamps: 0 };
  const rewards = rewardsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Reward));
  const pendingRewards = rewards.filter(r => !r.redeemed);

  return { uid: userId, stamps: user.stamps || 0, totalStamps: user.totalStamps || 0, rewards, pendingRewards };
}

/**
 * Add a stamp after a completed session.
 * Uses Firestore transaction to prevent duplicates.
 */
export async function addStamp(userId: string, sessionId: string): Promise<{
  stamps: number; totalStamps: number; newRewards: Reward[];
}> {
  const userRef = adminDb.collection(COLLECTIONS.USERS).doc(userId);

  // Prevent duplicate stamp for same session
  const dupCheck = await adminDb.collection(COLLECTIONS.REWARDS)
    .where("userId", "==", userId).where("sessionId", "==", sessionId).limit(1).get();
  if (!dupCheck.empty) throw new Error("Stamp already awarded for this session");

  let stamps = 0, totalStamps = 0;
  const newRewards: Reward[] = [];

  await adminDb.runTransaction(async tx => {
    const userDoc = await tx.get(userRef);
    const current = userDoc.exists ? (userDoc.data()?.stamps || 0) : 0;
    const currentTotal = userDoc.exists ? (userDoc.data()?.totalStamps || 0) : 0;

    stamps = current + 1;
    totalStamps = currentTotal + 1;

    // Check milestones
    for (const milestone of MILESTONES) {
      if (stamps === milestone.stamps) {
        const rewardRef = adminDb.collection(COLLECTIONS.REWARDS).doc();
        const reward: Omit<Reward, "id"> = {
          userId, type: milestone.type,
          stampMilestone: milestone.stamps,
          earnedAt: Timestamp.now(), redeemed: false, sessionId,
        };
        tx.set(rewardRef, reward);
        newRewards.push({ id: rewardRef.id, ...reward });
      }
    }

    // Reset stamps at 10
    const newStamps = stamps >= 10 ? 0 : stamps;

    tx.set(userRef, {
      stamps: newStamps,
      totalStamps,
      lastVisitAt: Timestamp.now(),
    }, { merge: true });

    stamps = newStamps;
  });

  return { stamps, totalStamps, newRewards };
}

/**
 * Redeem a reward (mark as used).
 */
export async function redeemReward(rewardId: string, userId: string): Promise<Reward> {
  const ref = adminDb.collection(COLLECTIONS.REWARDS).doc(rewardId);
  const snap = await ref.get();
  if (!snap.exists) throw new Error("Reward not found");
  const reward = snap.data() as Reward;
  if (reward.userId !== userId) throw new Error("Unauthorized");
  if (reward.redeemed) throw new Error("Reward already redeemed");

  await ref.update({ redeemed: true, redeemedAt: Timestamp.now() });
  return { id: rewardId, ...reward, redeemed: true };
}
