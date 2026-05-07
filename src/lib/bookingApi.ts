// src/lib/bookingApi.ts
// Sizabantu Barbershop — Calendar Booking API
// Calls YOUR Express backend (/api/calendar/*) — no CodeWords dependency.

// In dev: Vite proxies /api → http://localhost:3000
// In prod: same origin — Express serves both the app and the API

const API_BASE = "/api/calendar";

interface TimeSlot {
  start: string;
  end: string;
  display: string;
}

export interface AvailabilityResponse {
  date: string;
  total_slots: number;
  slots: TimeSlot[];
}

export interface CalendarBookingPayload {
  serviceName: string;
  userName: string;
  userEmail?: string;
  scheduledAt: string;   // ISO 8601 e.g. "2026-05-06T10:00:00+02:00"
  durationMinutes?: number;
  verificationCode: string;
  barberName?: string;
  type?: "scheduled" | "queue";
  firestoreBookingId?: string; // if set, eventId is written back to Firestore
}

export interface CreateBookingResponse {
  success: boolean;
  eventId: string;
  htmlLink: string;
  start: string;
  end: string;
}

export interface CancelBookingResponse {
  success: boolean;
  message: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────

async function apiCall<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? `API error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Check available time slots for a given date.
 * @param date       - "YYYY-MM-DD"
 * @param durationMin - appointment length in minutes (default 30)
 */
export function getAvailability(
  date: string,
  durationMin = 30
): Promise<AvailabilityResponse> {
  return apiCall<AvailabilityResponse>(
    "GET",
    `/availability?date=${date}&duration=${durationMin}`
  );
}

/**
 * Create a Google Calendar event for a confirmed booking.
 * Pass firestoreBookingId to auto-write eventId back to Firestore.
 */
export function createBooking(
  payload: CalendarBookingPayload
): Promise<CreateBookingResponse> {
  return apiCall<CreateBookingResponse>("POST", "/booking", payload);
}

/**
 * Cancel a booking — deletes the Google Calendar event.
 * Pass firestoreBookingId to also mark the Firestore doc as cancelled.
 */
export function cancelBooking(
  eventId: string,
  firestoreBookingId?: string
): Promise<CancelBookingResponse> {
  return apiCall<CancelBookingResponse>("DELETE", `/booking/${eventId}`, {
    firestoreBookingId,
  });
}
