// DELETE /api/calendar/:eventId — cancel a booking
import { admin, db } from "../_lib/firebase.js";
import { cancelCalendarEvent } from "../../src/lib/googleCalendar.js";

export default async function handler(req: any, res: any) {
  if (req.method !== "DELETE") return res.status(405).json({ error: "Method not allowed" });

  const { eventId } = req.query ?? {};
  if (!eventId) return res.status(400).json({ error: "eventId required" });

  const { firestoreBookingId } = req.body ?? {};

  try {
    await cancelCalendarEvent(eventId as string);

    if (firestoreBookingId) {
      await db.collection("bookings").doc(firestoreBookingId).update({
        status: "cancelled",
        calendarEventId: admin.firestore.FieldValue.delete(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    res.json({ success: true, message: `Event ${eventId} deleted.` });
  } catch (err) {
    console.error("[Calendar] Delete error:", err);
    res.status(500).json({ error: (err as Error).message });
  }
}
