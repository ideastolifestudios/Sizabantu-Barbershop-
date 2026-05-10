// src/lib/bookingApi.ts — SOP-compliant booking API client
// All writes go through Vercel API functions (bypasses Firestore rules correctly)
// Auth token automatically attached from Firebase Auth

import { getAuth } from "firebase/auth";

const API_BASE = "/api";

async function getAuthHeader(): Promise<string> {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  const token = await user.getIdToken();
  return `Bearer ${token}`;
}

async function apiCall<T>(method: string, path: string, body?: unknown): Promise<T> {
  const authHeader = await getAuthHeader();
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? `API error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ── Booking Creation (SOP-compliant) ────────────────────────────────────────

export interface CreateBookingPayload {
  type: "queue" | "scheduled";
  serviceId: string;
  scheduledAt?: string; // ISO 8601, required for type='scheduled'
  userName?: string;
  userEmail?: string;
}

export interface CreateBookingResponse {
  success: boolean;
  bookingId: string;
  verificationCode: string;
  queuePosition: number;
  message: string;
}

export function createBooking(payload: CreateBookingPayload): Promise<CreateBookingResponse> {
  return apiCall<CreateBookingResponse>("POST", "/bookings/create", payload);
}

// ── Admin Operations ─────────────────────────────────────────────────────────

export type BookingStatus =
  | "pending" | "confirmed" | "checked-in"
  | "in-progress" | "completed" | "expired" | "cancelled";

export interface UpdateBookingResponse {
  success: boolean;
  bookingId: string;
  status: BookingStatus;
}

export function adminUpdateBooking(
  bookingId: string,
  status: BookingStatus
): Promise<UpdateBookingResponse> {
  return apiCall<UpdateBookingResponse>("POST", "/admin/update-booking", { bookingId, status });
}

export interface DeleteBookingResponse {
  success: boolean;
  bookingId: string;
}

export function adminDeleteBooking(bookingId: string): Promise<DeleteBookingResponse> {
  return apiCall<DeleteBookingResponse>("DELETE", `/admin/delete-booking?bookingId=${bookingId}`);
}

// ── Availability (Google Calendar) ──────────────────────────────────────────

export interface TimeSlot {
  start: string;
  end: string;
  display: string;
}

export interface AvailabilityResponse {
  date: string;
  total_slots: number;
  slots: TimeSlot[];
}

export function getAvailability(date: string, durationMin = 30): Promise<AvailabilityResponse> {
  return apiCall<AvailabilityResponse>(
    "GET",
    `/calendar/availability?date=${date}&duration=${durationMin}`
  );
}

// ── Booking Verification (Check-in) ─────────────────────────────────────────

export function verifyBookingCode(code: string): Promise<{ success: boolean; booking: any }> {
  return apiCall("POST", "/bookings/verify", { code });
}
