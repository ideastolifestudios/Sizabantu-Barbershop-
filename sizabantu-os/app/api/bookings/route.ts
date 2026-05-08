import { NextRequest } from "next/server";
import { ok, err, handleApiError } from "@/lib/utils/api-helpers";
import { verifyAuth } from "@/lib/utils/auth";
import { createBooking, getUserBookings } from "@/lib/services/booking.service";
import { notifyBookingConfirmed } from "@/lib/services/notification.service";
import { format } from "date-fns";

export async function GET(req: NextRequest) {
  try {
    const { uid } = await verifyAuth(req);
    const bookings = await getUserBookings(uid);
    return ok(bookings);
  } catch (e) { return handleApiError(e); }
}

export async function POST(req: NextRequest) {
  try {
    const { uid } = await verifyAuth(req);
    const body = await req.json();
    const { userPhone, userName, barberId, serviceId, serviceName, servicePrice, date, startTime, notes } = body;
    if (!userPhone || !userName || !barberId || !serviceId || !date || !startTime)
      return err("Missing required fields: userPhone, userName, barberId, serviceId, date, startTime");

    const booking = await createBooking({ userId: uid, userPhone, userName, barberId, serviceId, serviceName, servicePrice, date, startTime, notes });

    // Fire-and-forget notification
    notifyBookingConfirmed({
      userId: uid, phone: userPhone, name: userName,
      date, time: startTime, service: serviceName, bookingId: booking.id,
    }).catch(console.error);

    return ok(booking, 201);
  } catch (e) { return handleApiError(e); }
}
