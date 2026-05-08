"use client";
import { useState, useEffect, useCallback } from "react";
import { db } from "@/lib/firebase/client";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { useAuth } from "./useAuth";
import type { QueueEntry } from "@/lib/types";

const API = "/api";

export function useQueue() {
  const { user, authFetch } = useAuth();
  const [myEntry, setMyEntry] = useState<QueueEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Real-time Firestore listener for user's queue entry
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "queue"),
      where("userId", "==", user.uid),
      where("status", "in", ["waiting", "notified", "checked-in", "serving"]),
      orderBy("joinedAt", "desc")
    );
    return onSnapshot(q, (snap) => {
      if (snap.empty) setMyEntry(null);
      else setMyEntry({ id: snap.docs[0].id, ...snap.docs[0].data() } as QueueEntry);
    }, (err) => setError(err.message));
  }, [user]);

  const joinQueue = useCallback(async (data: {
    userPhone: string; userName: string; serviceId?: string; serviceName?: string;
  }) => {
    setLoading(true);
    try {
      const res = await authFetch(`${API}/queue`, { method: "POST", body: JSON.stringify(data) });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data as QueueEntry;
    } finally { setLoading(false); }
  }, [authFetch]);

  const checkIn = useCallback(async (queueCode: string, sessionToken: string) => {
    const res = await fetch(`${API}/queue/checkin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ queueCode, sessionToken }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
    return json.data as QueueEntry;
  }, []);

  return { myEntry, loading, error, joinQueue, checkIn };
}
