// DELETE /api/admin/delete-booking?bookingId=xxx
// Admin-only hard delete with calendar cleanup.

import { admin, db } from "../_lib/firebase.js";
import { cancelCalendarEvent } from "../../src/lib/googleCalendar.js";

export default async function handler(req: any, res: any) {
  if (req.method !== "DELETE") return res.status(405).json({ error: "Method not allowed" });

  const authHeader = req.headers.authorization ?? "";
  let decoded: admin.auth.DecodedIdToken;
  try {
    decoded = await admin.auth().verifyIdToken(authHeader.replace("Bearer ", ""));
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const isAdmin =
    decoded.role === "admin" ||
    decoded.email === "cbrprints22@gmail.com" ||
    (decoded.email?.endsWith("@sizabantubarbershop.co.za"));

  if (!isAdmin) return res.status(403).json({ error: "Admin access required" });

  const bookingId = (req.query?.bookingId ?? req.body?.bookingId) as string;
  if (!bookingId) return res.status(400).json({ error: "bookingId required" });

  try {
    const bookingRef = db.collection("bookings").doc(bookingId);
    const snap = await bookingRef.get();
    if (!snap.exists) return res.status(404).json({ error: "Booking not found" });

    const data = snap.data()!;

    // Cancel Google Calendar event if linked
    if (data.calendarEventId) {
      try {
        await cancelCalendarEvent(data.calendarEventId);
      } catch (calErr) {
        console.warn("[Delete Booking] Calendar cleanup failed:", calErr);
        // Don't block delete
      }
    }

    // Soft delete: set status to cancelled (preserves audit trail)
    await bookingRef.update({
      status: "cancelled",
      cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ success: true, bookingId });
  } catch (err) {
    console.error("[Admin Delete Booking]", err);
    res.status(500).json({ error: (err as Error).message });
  }
}
