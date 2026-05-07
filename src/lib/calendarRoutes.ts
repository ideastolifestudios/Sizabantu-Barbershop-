// src/lib/calendarRoutes.ts
// Mount these routes in server.ts before the Vite middleware.
// They extend the existing Express app with real Google Calendar endpoints.

import { Router } from "express";
import admin from "firebase-admin";
import {
  syncToGoogleCalendar,
  getAvailability,
  cancelCalendarEvent,
  BookingPayload,
} from "./googleCalendar.js";

const router = Router();

// ── POST /api/calendar/booking ───────────────────────────────────────────────
// Creates a Google Calendar event for a confirmed booking.
// Also stores the returned eventId in the Firestore booking document.
//
// Body: BookingPayload + optional firestoreBookingId
router.post("/booking", async (req, res) => {
  const body: BookingPayload & { firestoreBookingId?: string } = req.body;

  if (!body.serviceName || !body.userName || !body.scheduledAt) {
    return res
      .status(400)
      .json({ error: "serviceName, userName, scheduledAt are required" });
  }

  try {
    const result = await syncToGoogleCalendar(body);

    // Persist eventId back to Firestore if booking ID was provided
    if (body.firestoreBookingId) {
      const db = admin.firestore();
      await db.collection("bookings").doc(body.firestoreBookingId).update({
        calendarEventId: result.eventId,
        calendarLink: result.htmlLink,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    res.json({ success: true, ...result });
  } catch (err) {
    console.error("[Calendar] Create event error:", err);
    res.status(500).json({ error: (err as Error).message });
  }
});

// ── GET /api/calendar/availability?date=YYYY-MM-DD&duration=30 ───────────────
// Returns available 30-min time slots for the given date.
router.get("/availability", async (req, res) => {
  const date     = req.query.date as string;
  const duration = parseInt(req.query.duration as string) || 30;

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res
      .status(400)
      .json({ error: "date is required in YYYY-MM-DD format" });
  }

  try {
    const result = await getAvailability(date, duration);
    res.json(result);
  } catch (err) {
    console.error("[Calendar] Availability error:", err);
    res.status(500).json({ error: (err as Error).message });
  }
});

// ── DELETE /api/calendar/booking/:eventId ────────────────────────────────────
// Deletes the Google Calendar event for a cancelled booking.
// Optionally updates Firestore booking status.
router.delete("/booking/:eventId", async (req, res) => {
  const { eventId }          = req.params;
  const { firestoreBookingId } = req.body ?? {};

  if (!eventId) {
    return res.status(400).json({ error: "eventId is required" });
  }

  try {
    await cancelCalendarEvent(eventId);

    if (firestoreBookingId) {
      const db = admin.firestore();
      await db.collection("bookings").doc(firestoreBookingId).update({
        status: "cancelled",
        calendarEventId: admin.firestore.FieldValue.delete(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    res.json({ success: true, message: `Event ${eventId} deleted.` });
  } catch (err) {
    console.error("[Calendar] Delete event error:", err);
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
