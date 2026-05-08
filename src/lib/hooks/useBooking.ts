"use client";
import { useState, useCallback } from "react";
import { useAuth } from "./useAuth";
import type { Booking } from "@/lib/types";

const API = "/api";

export function useBooking() {
  const { authFetch } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API}/bookings`);
      const json = await res.json();
      if (json.success) setBookings(json.data);
      else setError(json.error);
    } catch (e) { setError("Failed to load bookings"); }
    finally { setLoading(false); }
  }, [authFetch]);

  const getSlots = useCallback(async (date: string, barberId: string) => {
    const res = await fetch(`${API}/bookings/slots?date=${date}&barberId=${barberId}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
    return json.data;
  }, []);

  const createBooking = useCallback(async (data: {
    userPhone: string; userName: string; barberId: string;
    serviceId: string; serviceName: string; servicePrice: number;
    date: string; startTime: string; notes?: string;
  }) => {
    setLoading(true);
    try {
      const res = await authFetch(`${API}/bookings`, { method: "POST", body: JSON.stringify(data) });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setBookings(prev => [json.data, ...prev]);
      return json.data as Booking;
    } finally { setLoading(false); }
  }, [authFetch]);

  const cancelBooking = useCallback(async (bookingId: string) => {
    const res = await authFetch(`${API}/bookings/${bookingId}`, {
      method: "PATCH", body: JSON.stringify({ action: "cancel" }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: "cancelled" as const } : b));
  }, [authFetch]);

  return { bookings, loading, error, fetchBookings, getSlots, createBooking, cancelBooking };
}
