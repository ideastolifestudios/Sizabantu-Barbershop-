// POST /api/calendar/booking — create a Google Calendar event
import { admin, db } from "../_lib/firebase.js";
import { syncToGoogleCalendar } from "../../src/lib/googleCalendar.js";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const body = req.body ?? {};
  const { serviceName, userName, scheduledAt, verificationCode } = body;

  if (!serviceName || !userName || !scheduledAt) {
    return res.status(400).json({ error: "serviceName, userName, scheduledAt are required" });
  }

  try {
    const result = await syncToGoogleCalendar({
      serviceName,
      userName,
      userEmail: body.userEmail,
      scheduledAt,
      durationMinutes: body.durationMinutes ?? 30,
      verificationCode: verificationCode ?? "000000",
      barberName: body.barberName,
      type: body.type ?? "scheduled",
      id: body.firestoreBookingId,
    });

    // Write eventId back to Firestore if booking ID provided
    if (body.firestoreBookingId) {
      await db.collection("bookings").doc(body.firestoreBookingId).update({
        calendarEventId: result.eventId,
        calendarLink: result.htmlLink,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    res.json({ success: true, ...result });
  } catch (err) {
    console.error("[Calendar] Create error:", err);
    res.status(500).json({ error: (err as Error).message });
  }
}
