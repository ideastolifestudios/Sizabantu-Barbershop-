import { adminDb, COLLECTIONS } from "@/lib/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";
import type { NotificationEvent, NotificationRecord } from "@/lib/types";

const SHOP_NAME = process.env.SHOP_NAME || "Sizabantu Barbershop";

const TEMPLATES: Record<NotificationEvent, (d: Record<string, string>) => string> = {
  booking_confirmed: (d) => `✅ *${SHOP_NAME}*\n\nBooking confirmed, ${d.name}!\n\n📅 ${d.date} at ${d.time}\n✂️ ${d.service}\n🎫 Ref: ${d.bookingId}\n\n_Reply CANCEL to cancel._`,
  booking_cancelled: (d) => `❌ *${SHOP_NAME}*\n\nYour booking on ${d.date} at ${d.time} has been cancelled.\n\nRebook: ${process.env.NEXT_PUBLIC_SHOP_URL}`,
  queue_joined: (d) => `🪒 *${SHOP_NAME} — Queue*\n\nYou're in! Code: *${d.code}*\nPosition: *#${d.position}*\nEst. wait: *${d.wait}*\n\n🔑 Token: ${d.token}\n\nWe'll WhatsApp you when it's almost your turn.`,
  queue_position_update: (d) => `📍 *${SHOP_NAME}* — Queue Update\n\nYou're now #${d.position} (${d.wait} away).\nCode: *${d.code}*`,
  next_up: (d) => `🔔 *${SHOP_NAME}* — YOU'RE NEXT!\n\nHead to the shop NOW. 15 minutes to check in.\n\nCode: *${d.code}* | Token: *${d.token}*`,
  reminder_10min: (d) => `⏰ *${SHOP_NAME}* — Reminder\n\nYour appointment (${d.service}) is in 10 minutes at ${d.time}.`,
  session_started: (d) => `💈 *${SHOP_NAME}*\n\n${d.name}, your session has started! Enjoy your cut 🔥`,
  session_completed: (d) => `✨ *${SHOP_NAME}*\n\nSession complete! Thanks, ${d.name}.\n\n⭐ Stamps: *${d.stamps}/10*\n${d.rewardMessage || ""}`,
  session_expired: (d) => `⚠️ *${SHOP_NAME}*\n\nYour queue spot (Code: ${d.code}) expired. Rejoin anytime.`,
  no_show: (d) => `😕 *${SHOP_NAME}*\n\nWe missed you, ${d.name}. Your queue spot was released.\n\nRebook: ${process.env.NEXT_PUBLIC_SHOP_URL}`,
  reward_unlocked: (d) => `🎁 *${SHOP_NAME} — Reward Unlocked!*\n\n${d.name}, you've earned a *${d.reward}*!\n\nShow this message at the shop to redeem. Ref: ${d.rewardId}`,
};

async function sendWhatsApp(phone: string, message: string): Promise<boolean> {
  const apiKey = process.env.WASSENGER_API_KEY;
  if (!apiKey) { console.warn("WASSENGER_API_KEY not set"); return false; }
  try {
    const res = await fetch("https://api.wassenger.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Token": apiKey },
      body: JSON.stringify({ phone: `+${phone.replace(/[^0-9]/g, "")}`, message, ...(process.env.WASSENGER_DEVICE_PHONE ? { device: process.env.WASSENGER_DEVICE_PHONE } : {}) }),
    });
    return res.ok;
  } catch { return false; }
}

async function sendEmail(to: string, subject: string, body: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify({ from: process.env.NOTIFICATION_FROM_EMAIL || "noreply@sizabantubarbershop.co.za", to, subject, html: `<p>${body.replace(/\n/g, "<br>")}</p>` }),
    });
    return res.ok;
  } catch { return false; }
}

export async function sendNotification({ userId, phone, email, event, templateData, channel = "whatsapp" }: {
  userId: string; phone?: string; email?: string;
  event: NotificationEvent; templateData: Record<string, string>;
  channel?: "whatsapp" | "sms" | "email";
}): Promise<void> {
  const message = TEMPLATES[event](templateData);
  let status: "sent" | "failed" = "failed";
  try {
    if (channel === "whatsapp" && phone) status = (await sendWhatsApp(phone, message)) ? "sent" : "failed";
    else if (channel === "email" && email) status = (await sendEmail(email, `${SHOP_NAME}`, message)) ? "sent" : "failed";
  } catch { status = "failed"; }
  const record: Omit<NotificationRecord, "id"> = { userId, phone, email, event, channel, status, message, retryCount: 0, createdAt: Timestamp.now(), ...(status === "sent" ? { sentAt: Timestamp.now() } : {}) };
  await adminDb.collection(COLLECTIONS.NOTIFICATIONS).add(record).catch(console.error);
}

export async function notifyBookingConfirmed(data: { userId: string; phone: string; name: string; date: string; time: string; service: string; bookingId: string }): Promise<void> {
  await sendNotification({ userId: data.userId, phone: data.phone, event: "booking_confirmed", templateData: { name: data.name, date: data.date, time: data.time, service: data.service, bookingId: data.bookingId } });
}

export async function notifyQueueJoined(data: { userId: string; phone: string; code: string; position: string; wait: string; token: string }): Promise<void> {
  await sendNotification({ userId: data.userId, phone: data.phone, event: "queue_joined", templateData: { code: data.code, position: data.position, wait: data.wait, token: data.token } });
}

export async function notifyNextUp(data: { userId: string; phone: string; code: string; token: string }): Promise<void> {
  await sendNotification({ userId: data.userId, phone: data.phone, event: "next_up", templateData: { code: data.code, token: data.token } });
}

export async function notifySessionCompleted(data: { userId: string; phone: string; name: string; stamps: string; rewardMessage?: string }): Promise<void> {
  await sendNotification({ userId: data.userId, phone: data.phone, event: "session_completed", templateData: { name: data.name, stamps: data.stamps, rewardMessage: data.rewardMessage || "" } });
}

export async function notifyRewardUnlocked(data: { userId: string; phone: string; name: string; reward: string; rewardId: string }): Promise<void> {
  await sendNotification({ userId: data.userId, phone: data.phone, event: "reward_unlocked", templateData: { name: data.name, reward: data.reward, rewardId: data.rewardId } });
}
