// src/lib/googleCalendar.ts
// Direct Google Calendar integration using a Service Account
// No CodeWords dependency at runtime — pure googleapis

import { google, calendar_v3 } from "googleapis";

const CALENDAR_ID = "sizabantubarbershop@gmail.com";
const TIMEZONE    = "Africa/Johannesburg";
const OPEN_HOUR   = 8;   // 08:00 SAST
const CLOSE_HOUR  = 18;  // 18:00 SAST
const SLOT_MINS   = 30;

// ── Auth ────────────────────────────────────────────────────────────────────

function getGoogleAuth() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON is not set");

  const key = typeof raw === "string" ? JSON.parse(raw) : raw;

  return new google.auth.GoogleAuth({
    credentials: key,
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });
}

function getCalendarClient() {
  const auth = getGoogleAuth();
  return google.calendar({ version: "v3", auth } as any);
}

// ── Types ────────────────────────────────────────────────────────────────────

export interface BookingPayload {
  id?: string;
  serviceName: string;
  userName: string;
  userEmail?: string;
  verificationCode: string;
  scheduledAt: string; // ISO 8601 e.g. "2026-05-06T10:00:00+02:00"
  durationMinutes?: number;
  barberName?: string;
  type?: "scheduled" | "queue";
}

export interface CalendarEventResult {
  eventId: string;
  htmlLink: string;
  start: string;
  end: string;
}

export interface TimeSlot {
  start: string;
  end: string;
  display: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function stripTzOffset(iso: string): string {
  // Remove +HH:MM or Z so googleapis treats it as local SAST time
  if (iso.endsWith("Z")) return iso.slice(0, -1);
  const plusIdx = iso.lastIndexOf("+", iso.length - 6);
  if (plusIdx > 10) return iso.slice(0, plusIdx);
  return iso;
}

// ── Create Calendar Event ────────────────────────────────────────────────────

export async function syncToGoogleCalendar(
  booking: BookingPayload
): Promise<CalendarEventResult> {
  const cal = getCalendarClient();
  const durationMins = booking.durationMinutes ?? 30;
  const localStart = stripTzOffset(booking.scheduledAt);

  const startDate = new Date(booking.scheduledAt);
  const endDate   = new Date(startDate.getTime() + durationMins * 60_000);
  const localEnd  = stripTzOffset(endDate.toISOString());

  const summary = booking.barberName
    ? `${booking.serviceName} - ${booking.userName} (Barber: ${booking.barberName})`
    : `${booking.serviceName} - ${booking.userName}`;

  const description = [
    `Service: ${booking.serviceName}`,
    `Client: ${booking.userName}`,
    booking.userEmail ? `Email: ${booking.userEmail}` : null,
    `Verification: ${booking.verificationCode}`,
    `Type: ${booking.type ?? "scheduled"}`,
    `---`,
    `Sizabantu Barbershop`,
    `644 Nancy Ndamase St, Klipfontein View, Johannesburg, 1685`,
  ]
    .filter(Boolean)
    .join("\n");

  const event: calendar_v3.Schema$Event = {
    summary,
    description,
    location: "644 Nancy Ndamase St, Klipfontein View, Johannesburg, 1685",
    start: { dateTime: localStart, timeZone: TIMEZONE },
    end:   { dateTime: localEnd,   timeZone: TIMEZONE },
    reminders: {
      useDefault: false,
      overrides: [
        { method: "popup", minutes: 30 },
        { method: "email", minutes: 60 },
      ],
    },
  };

  const response = await cal.events.insert({
    calendarId: CALENDAR_ID,
    requestBody: event,
  });

  const created = response.data;
  console.log(`[Calendar] Event created: ${created.id} — ${summary}`);

  return {
    eventId:  created.id!,
    htmlLink: created.htmlLink!,
    start:    created.start?.dateTime ?? localStart,
    end:      created.end?.dateTime   ?? localEnd,
  };
}

// ── Check Availability ───────────────────────────────────────────────────────

export async function getAvailability(
  date: string,
  durationMins: number = 30
): Promise<{ date: string; total_slots: number; slots: TimeSlot[] }> {
  const cal = getCalendarClient();

  const timeMin = `${date}T${String(OPEN_HOUR).padStart(2, "0")}:00:00+02:00`;
  const timeMax = `${date}T${String(CLOSE_HOUR).padStart(2, "0")}:00:00+02:00`;

  const response = await cal.events.list({
    calendarId: CALENDAR_ID,
    timeMin,
    timeMax,
    singleEvents: true,
    orderBy: "startTime",
    timeZone: TIMEZONE,
  });

  const events = (response.data.items ?? []).filter(
    (e) => e.status !== "cancelled"
  );

  // Build booked intervals
  const booked: [Date, Date][] = events.flatMap((ev) => {
    const s = ev.start?.dateTime;
    const e = ev.end?.dateTime;
    if (!s || !e) return [];
    return [[new Date(s), new Date(e)]];
  });

  // Generate 30-min slots
  const slots: TimeSlot[] = [];
  let current = new Date(`${date}T${String(OPEN_HOUR).padStart(2, "0")}:00:00+02:00`);
  const close  = new Date(`${date}T${String(CLOSE_HOUR).padStart(2, "0")}:00:00+02:00`);
  const dur    = durationMins * 60_000;
  const step   = SLOT_MINS  * 60_000;

  while (current.getTime() + dur <= close.getTime()) {
    const slotEnd = new Date(current.getTime() + dur);
    const conflict = booked.some(
      ([bs, be]) => !(slotEnd <= bs || current >= be)
    );
    if (!conflict) {
      const pad = (n: number) => String(n).padStart(2, "0");
      slots.push({
        start: current.toISOString(),
        end:   slotEnd.toISOString(),
        display: `${pad(current.getHours())}:${pad(current.getMinutes())} - ${pad(slotEnd.getHours())}:${pad(slotEnd.getMinutes())}`,
      });
    }
    current = new Date(current.getTime() + step);
  }

  return { date, total_slots: slots.length, slots };
}

// ── Cancel Event ─────────────────────────────────────────────────────────────

export async function cancelCalendarEvent(eventId: string): Promise<void> {
  const cal = getCalendarClient();
  await cal.events.delete({ calendarId: CALENDAR_ID, eventId });
  console.log(`[Calendar] Event deleted: ${eventId}`);
}
