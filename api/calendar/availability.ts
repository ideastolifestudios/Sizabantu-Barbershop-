// GET /api/calendar/availability?date=YYYY-MM-DD&duration=30
import { getAvailability } from "../../src/lib/googleCalendar.js";

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { date, duration } = req.query ?? {};

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: "date required in YYYY-MM-DD format" });
  }

  try {
    const result = await getAvailability(date, parseInt(duration as string) || 30);
    res.json(result);
  } catch (err) {
    console.error("[Calendar] Availability error:", err);
    res.status(500).json({ error: (err as Error).message });
  }
}
