"use client";
import { useState, useEffect, useCallback } from "react";
import { db } from "@/lib/firebase/client";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { useAuth } from "./useAuth";
import type { RewardLedger } from "@/lib/types";

const API = "/api";

export function useRewards() {
  const { user, authFetch } = useAuth();
  const [ledger, setLedger] = useState<RewardLedger | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchLedger = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await authFetch(`${API}/rewards`);
      const json = await res.json();
      if (json.success) setLedger(json.data);
    } finally { setLoading(false); }
  }, [user, authFetch]);

  useEffect(() => { fetchLedger(); }, [fetchLedger]);

  const redeemReward = useCallback(async (rewardId: string) => {
    const res = await authFetch(`${API}/rewards/redeem`, {
      method: "POST", body: JSON.stringify({ rewardId }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
    await fetchLedger();
    return json.data;
  }, [authFetch, fetchLedger]);

  return { ledger, loading, fetchLedger, redeemReward };
}
