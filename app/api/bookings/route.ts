import { NextRequest } from "next/server";
import { ok, err, handleApiError } from "@/lib/utils/api-helpers";
import { verifyAuth } from "@/lib/utils/auth";
import {
  createBooking,
  getUserBookings,
  getAvailableSlots,
} from "@/lib/services/booking.service";
import { notifyBookingConfirmed } from "@/lib/services/notification.service";

// GET /api/bookings          → user's bookings
// GET /api/bookings?slots=true&date=YYYY-MM-DD&barberId=xxx → available slots
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // ── Slots sub-route (replaces /api/bookings/slots) ──────────────────────
    if (searchParams.get("slots") === "true") {
      const date = searchParams.get("date");
      const barberId = searchParams.get("barberId");
      if (!date || !barberId)
        return err("Query params required: date (YYYY-MM-DD), barberId");
      const result = await getAvailableSlots(date, barberId);
      return ok(result);
    }

    // ── User bookings ────────────────────────────────────────────────────────
    const { uid } = await verifyAuth(req);
    const bookings = await getUserBookings(uid);
    return ok(bookings);
  } catch (e) {
    return handleApiError(e);
  }
}

// POST /api/bookings → create booking
export async function POST(req: NextRequest) {
  try {
    const { uid } = await verifyAuth(req);
    const body = await req.json();
    const {
      userPhone, userName, barberId, serviceId,
      serviceName, servicePrice, date, startTime, notes,
    } = body;

    if (!userPhone || !userName || !barberId || !serviceId || !date || !startTime)
      return err("Missing required fields: userPhone, userName, barberId, serviceId, date, startTime");

    const booking = await createBooking({
      userId: uid, userPhone, userName, barberId,
      serviceId, serviceName, servicePrice, date, startTime, notes,
    });

    notifyBookingConfirmed({
      userId: uid, phone: userPhone, name: userName,
      date, time: startTime, service: serviceName, bookingId: booking.id,
    }).catch(console.error);

    return ok(booking, 201);
  } catch (e) {
    return handleApiError(e);
  }
}
