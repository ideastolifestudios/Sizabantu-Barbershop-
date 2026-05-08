import { adminDb, COLLECTIONS } from "@/lib/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";
import type { NotificationEvent, NotificationRecord } from "@/lib/types";

const SHOP_NAME = process.env.SHOP_NAME || "Sizabantu Barbershop";
const SHOP_PHONE = process.env.SHOP_PHONE || "+27607246829";

// ─── Message Templates ─────────────────────────────────────────────────────
const TEMPLATES: Record<NotificationEvent, (data: Record<string, string>) => string> = {
  booking_confirmed: (d) =>
    `✅ *${SHOP_NAME}*

Booking confirmed, ${d.name}!

📅 ${d.date} at ${d.time}
✂️ ${d.service}
🎫 Ref: ${d.bookingId}

_Reply CANCEL to cancel._`,

  booking_cancelled: (d) =>
    `❌ *${SHOP_NAME}*

Your booking on ${d.date} at ${d.time} has been cancelled.

Book again: ${process.env.NEXT_PUBLIC_SHOP_URL}`,

  queue_joined: (d) =>
    `🪒 *${SHOP_NAME} — Queue*

You're in! Queue code: *${d.code}*
Position: *#${d.position}*
Est. wait: *${d.wait}*

🔑 Token: ${d.token}

We'll WhatsApp you when it's almost your turn.`,

  queue_position_update: (d) =>
    `📍 *${SHOP_NAME}* — Queue Update

You're now #${d.position} (${d.wait} away).
Code: *${d.code}*`,

  next_up: (d) =>
    `🔔 *${SHOP_NAME}* — YOU'RE NEXT!

Please head to the shop NOW. You have *15 minutes* to check in or you'll lose your spot.

Code: *${d.code}* | Token: *${d.token}*`,

  reminder_10min: (d) =>
    `⏰ *${SHOP_NAME}* — Reminder

Your appointment (${d.service}) is in 10 minutes at ${d.time}.

Address: ${process.env.SHOP_ADDRESS}`,

  session_started: (d) =>
    `💈 *${SHOP_NAME}*

${d.name}, your session has started!
Barber: ${d.barber}
Enjoy your cut! 🔥`,

  session_completed: (d) =>
    `✨ *${SHOP_NAME}*

Session complete! Thanks, ${d.name}.

⭐ Stamps: *${d.stamps}/10*
${d.rewardMessage || ""}

Rate us on Google: ${process.env.NEXT_PUBLIC_SHOP_URL}`,

  session_expired: (d) =>
    `⚠️ *${SHOP_NAME}*

Your queue spot (Code: ${d.code}) expired. You can rejoin anytime at ${process.env.NEXT_PUBLIC_SHOP_URL}`,

  no_show: (d) =>
    `😕 *${SHOP_NAME}*

We missed you, ${d.name}. Your queue spot was released.

Rebook: ${process.env.NEXT_PUBLIC_SHOP_URL}`,

  reward_unlocked: (d) =>
    `🎁 *${SHOP_NAME} — Reward Unlocked!*

${d.name}, you've earned a *${d.reward}*!

Show this message at the shop to redeem.

Ref: ${d.rewardId}`,
};

// ─── Wassenger API ─────────────────────────────────────────────────────────
async function sendWhatsApp(phone: string, message: string): Promise<boolean> {
  const apiKey = process.env.WASSENGER_API_KEY;
  if (!apiKey) { console.warn("WASSENGER_API_KEY not set — skipping WhatsApp"); return false; }

  const devicePhone = process.env.WASSENGER_DEVICE_PHONE;
  const cleanPhone = phone.replace(/[^0-9]/g, "");

  try {
    const res = await fetch("https://api.wassenger.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Token": apiKey },
      body: JSON.stringify({
        phone: `+${cleanPhone}`,
        message,
        ...(devicePhone ? { device: devicePhone } : {}),
      }),
    });
    return res.ok;
  } catch (e) {
    console.error("[WhatsApp]", e);
    return false;
  }
}

// ─── Resend Email ──────────────────────────────────────────────────────────
async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify({
        from: process.env.NOTIFICATION_FROM_EMAIL || `noreply@sizabantubarbershop.co.za`,
        to, subject,
        html: `<div style="font-family:sans-serif;max-width:480px;margin:auto;">${html.replace(/\n/g, "<br>").replace(/\*(.*?)\*/g, "<strong>$1</strong>")}</div>`,
      }),
    });
    return res.ok;
  } catch (e) {
    console.error("[Email]", e);
    return false;
  }
}

// ─── Main notification dispatcher ──────────────────────────────────────────
export async function sendNotification({
  userId, phone, email, event, templateData, channel = "whatsapp",
}: {
  userId: string; phone?: string; email?: string;
  event: NotificationEvent; templateData: Record<string, string>;
  channel?: "whatsapp" | "sms" | "email";
}): Promise<void> {
  const message = TEMPLATES[event](templateData);
  let status: "sent" | "failed" = "failed";

  try {
    if (channel === "whatsapp" && phone) {
      const ok = await sendWhatsApp(phone, message);
      status = ok ? "sent" : "failed";
    } else if (channel === "email" && email) {
      const ok = await sendEmail(email, `${SHOP_NAME} — Notification`, message);
      status = ok ? "sent" : "failed";
    }
  } catch (e) {
    status = "failed";
    console.error("[Notification]", e);
  }

  // Log to Firestore
  const record: Omit<NotificationRecord, "id"> = {
    userId, phone, email, event, channel, status, message,
    retryCount: 0, createdAt: Timestamp.now(),
    ...(status === "sent" ? { sentAt: Timestamp.now() } : {}),
  };
  await adminDb.collection(COLLECTIONS.NOTIFICATIONS).add(record).catch(console.error);
}

/** Send booking confirmation WhatsApp */
export async function notifyBookingConfirmed(data: {
  userId: string; phone: string; name: string;
  date: string; time: string; service: string; bookingId: string;
}): Promise<void> {
  await sendNotification({
    userId: data.userId, phone: data.phone, event: "booking_confirmed",
    templateData: { name: data.name, date: data.date, time: data.time, service: data.service, bookingId: data.bookingId },
  });
}

/** Send queue joined confirmation */
export async function notifyQueueJoined(data: {
  userId: string; phone: string; code: string; position: string; wait: string; token: string;
}): Promise<void> {
  await sendNotification({
    userId: data.userId, phone: data.phone, event: "queue_joined",
    templateData: { code: data.code, position: data.position, wait: data.wait, token: data.token },
  });
}

/** Send next-up alert */
export async function notifyNextUp(data: {
  userId: string; phone: string; code: string; token: string;
}): Promise<void> {
  await sendNotification({
    userId: data.userId, phone: data.phone, event: "next_up",
    templateData: { code: data.code, token: data.token },
  });
}

/** Send session complete + stamps */
export async function notifySessionCompleted(data: {
  userId: string; phone: string; name: string; stamps: string; rewardMessage?: string;
}): Promise<void> {
  await sendNotification({
    userId: data.userId, phone: data.phone, event: "session_completed",
    templateData: { name: data.name, stamps: data.stamps, rewardMessage: data.rewardMessage || "" },
  });
}

/** Send reward unlocked */
export async function notifyRewardUnlocked(data: {
  userId: string; phone: string; name: string; reward: string; rewardId: string;
}): Promise<void> {
  await sendNotification({
    userId: data.userId, phone: data.phone, event: "reward_unlocked",
    templateData: { name: data.name, reward: data.reward, rewardId: data.rewardId },
  });
}
