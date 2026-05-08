import { NextRequest } from "next/server";
import { ok, err, handleApiError } from "../../../../lib/utils/api-helpers";
import { verifyAuth } from "../../../../lib/utils/auth";
import { cancelBooking, checkInBooking, getBookingById } from "../../../../lib/services/booking.service";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { uid } = await verifyAuth(req);
    const { id } = await params;
    const booking = await getBookingById(id);
    if (booking.userId !== uid) return err("Unauthorized", 403);
    return ok(booking);
  } catch (e) { return handleApiError(e); }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { uid } = await verifyAuth(req);
    const { id } = await params;
    const { action } = await req.json();

    if (action === "cancel") {
      await cancelBooking(id, uid);
      return ok({ message: "Booking cancelled" });
    }
    if (action === "checkin") {
      const booking = await checkInBooking(id, uid);
      return ok(booking);
    }
    return err("Unknown action. Use: cancel | checkin");
  } catch (e) { return handleApiError(e); }
}
