/**
 * Sizabantu Barbershop — Typed API Client
 * Wraps all Next.js API routes with full TypeScript types.
 * Usage: import { api } from "@/lib/api/client"
 */
import { auth } from "@/lib/firebase/client";
import { getIdToken } from "firebase/auth";
import type {
  Booking, QueueEntry, RewardLedger, Reward,
  BarberService, ApiResponse,
} from "@/lib/types";

// ─── Base fetcher ──────────────────────────────────────────────────────────
async function authFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated — please sign in");

  const token = await getIdToken(user, false);

  const res = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  const json: ApiResponse<T> = await res.json();
  if (!json.success) throw new Error((json as { error: string }).error);
  return (json as { data: T }).data;
}

// Public fetcher (no auth token needed)
async function publicFetch<T>(path: string): Promise<T> {
  const res = await fetch(path);
  const json: ApiResponse<T> = await res.json();
  if (!json.success) throw new Error((json as { error: string }).error);
  return (json as { data: T }).data;
}

// ─── Auth ──────────────────────────────────────────────────────────────────
const authApi = {
  /** Register/sync user profile after Firebase sign-in */
  verify: (displayName?: string) =>
    authFetch<{ uid: string; isNew: boolean }>("/api/auth/verify", {
      method: "POST",
      body: JSON.stringify({ displayName }),
    }),
};

// ─── Bookings ─────────────────────────────────────────────────────────────
const bookingsApi = {
  /** List all bookings for the signed-in user */
  list: () => authFetch<Booking[]>("/api/bookings"),

  /** Get available time slots for a date + barber */
  slots: (date: string, barberId: string) =>
    publicFetch<{ available: boolean; reason?: string; slots: { time: string; available: boolean }[] }>(
      `/api/bookings/slots?date=${date}&barberId=${encodeURIComponent(barberId)}`
    ),

  /** Create a new booking */
  create: (data: {
    userPhone: string;
    userName: string;
    barberId: string;
    serviceId: string;
    serviceName: string;
    servicePrice: number;
    date: string;
    startTime: string;
    notes?: string;
  }) =>
    authFetch<Booking>("/api/bookings", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /** Cancel a booking */
  cancel: (bookingId: string) =>
    authFetch<{ message: string }>(`/api/bookings/${bookingId}`, {
      method: "PATCH",
      body: JSON.stringify({ action: "cancel" }),
    }),

  /** Check in to a booked appointment */
  checkIn: (bookingId: string) =>
    authFetch<Booking>(`/api/bookings/${bookingId}`, {
      method: "PATCH",
      body: JSON.stringify({ action: "checkin" }),
    }),

  /** Get a single booking by ID */
  get: (bookingId: string) =>
    authFetch<Booking>(`/api/bookings/${bookingId}`),
};

// ─── Queue ────────────────────────────────────────────────────────────────
const queueApi = {
  /** Join the live walk-in queue */
  join: (data: {
    userPhone: string;
    userName: string;
    serviceId?: string;
    serviceName?: string;
  }) =>
    authFetch<QueueEntry>("/api/queue", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /** Get current user's queue status + live position */
  myStatus: () => authFetch<QueueEntry | null>("/api/queue/status"),

  /** Get all active queue entries (barber dashboard) */
  allActive: () => authFetch<QueueEntry[]>("/api/queue/status?all=true"),

  /** Check in using queue code + session token (kiosk/QR scan) */
  checkIn: (queueCode: string, sessionToken: string) =>
    publicFetch<QueueEntry>("/api/queue/checkin") as Promise<QueueEntry>,

  /** Complete a session (barber action) */
  complete: (entryId: string) =>
    authFetch<{ entry: QueueEntry; stamps: number; newRewards: Reward[] }>(
      "/api/queue/complete",
      { method: "POST", body: JSON.stringify({ entryId }) }
    ),

  /** Process a no-show (barber action) */
  noShow: (entryId: string) =>
    authFetch<{ processed: string; nextNotified: string | null }>(
      "/api/queue/noshow",
      { method: "POST", body: JSON.stringify({ entryId }) }
    ),
};

// ─── Queue check-in (public — no auth needed) ─────────────────────────────
async function queueCheckIn(queueCode: string, sessionToken: string): Promise<QueueEntry> {
  const res = await fetch("/api/queue/checkin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ queueCode, sessionToken }),
  });
  const json: ApiResponse<QueueEntry> = await res.json();
  if (!json.success) throw new Error((json as { error: string }).error);
  return (json as { data: QueueEntry }).data;
}

// ─── Rewards ──────────────────────────────────────────────────────────────
const rewardsApi = {
  /** Get stamps + reward history for signed-in user */
  get: () => authFetch<RewardLedger>("/api/rewards"),

  /** Redeem a reward */
  redeem: (rewardId: string) =>
    authFetch<Reward>("/api/rewards/redeem", {
      method: "POST",
      body: JSON.stringify({ rewardId }),
    }),
};

// ─── QR Code ──────────────────────────────────────────────────────────────
const qrApi = {
  /** Get QR code URL for a session/queue code */
  url: (code: string, format: "svg" | "png" = "png") =>
    `/api/qr/${encodeURIComponent(code)}?format=${format}`,
};

// ─── Health ───────────────────────────────────────────────────────────────
const healthApi = {
  check: () =>
    publicFetch<{ status: string; firestore: string; timestamp: string }>("/api/health"),
};

// ─── Named export ─────────────────────────────────────────────────────────
export const api = {
  auth: authApi,
  bookings: bookingsApi,
  queue: queueApi,
  queueCheckIn,
  rewards: rewardsApi,
  qr: qrApi,
  health: healthApi,
};

export type { Booking, QueueEntry, RewardLedger, Reward };
