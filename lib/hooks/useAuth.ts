"use client";
import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase/client";
import { onAuthStateChanged, User, getIdToken } from "firebase/auth";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => { setUser(u); setLoading(false); });
  }, []);

  const getToken = async () => {
    if (!user) throw new Error("Not authenticated");
    return getIdToken(user, false);
  };

  const authFetch = async (url: string, options: RequestInit = {}) => {
    const token = await getToken();
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
  };

  return { user, loading, getToken, authFetch };
}
