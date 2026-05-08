import { NextRequest } from "next/server";
import { ok, err, handleApiError } from "@/lib/utils/api-helpers";
import { getAvailableSlots } from "@/lib/services/booking.service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const barberId = searchParams.get("barberId");
    if (!date || !barberId) return err("Query params required: date (YYYY-MM-DD), barberId");
    const result = await getAvailableSlots(date, barberId);
    return ok(result);
  } catch (e) { return handleApiError(e); }
}
