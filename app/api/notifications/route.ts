import { NextRequest } from "next/server";
import { ok, err, handleApiError } from "@/lib/utils/api-helpers";
import { verifySchedulerSecret } from "@/lib/utils/auth";
import { sendNotification } from "@/lib/services/notification.service";
import type { NotificationEvent } from "@/lib/types";

// Internal endpoint for sending arbitrary notifications
// Secured by scheduler secret — not for public access
export async function POST(req: NextRequest) {
  try {
    verifySchedulerSecret(req);
    const { userId, phone, email, event, templateData, channel } = await req.json();
    if (!userId || !event) return err("userId and event are required");
    await sendNotification({ userId, phone, email, event: event as NotificationEvent, templateData, channel });
    return ok({ sent: true });
  } catch (e) { return handleApiError(e); }
}
