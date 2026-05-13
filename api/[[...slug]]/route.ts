/**
 * Consolidated API — 1 function instead of 9
 * All routes preserved, same URL patterns
 */
import { NextRequest, NextResponse } from "next/server";
import { ok, err, handleApiError } from "@/lib/utils/api-helpers";
import { verifyAuth, verifySchedulerSecret } from "@/lib/utils/auth";
import { adminDb, COLLECTIONS } from "@/lib/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";
import { createBooking, getUserBookings, getBookingById, cancelBooking, checkInBooking, getAvailableSlots, expireStaleBookings } from "@/lib/services/booking.service";
import { joinQueue, checkIn, completeSession, processNoShow, getQueueStatus, getActiveQueue, notifyNextInQueue, autoAssignBarber, expireStaleQueueEntries } from "@/lib/services/queue.service";
import { addStamp, getUserRewards, redeemReward } from "@/lib/services/rewards.service";
import { sendNotification, notifyBookingConfirmed, notifyQueueJoined, notifySessionCompleted, notifyRewardUnlocked } from "@/lib/services/notification.service";
import type { NotificationEvent } from "@/lib/types";
import QRCode from "qrcode";

type Ctx = { params: Promise<{ slug?: string[] }> };
const p = (s: string[] | undefined) => (s ?? []).join("/");

export async function GET(req: NextRequest, { params }: Ctx) {
  const slug = (await params).slug ?? [];
  const path = p(slug);
  const sp = req.nextUrl.searchParams;
  try {
    if (path === "health" || path === "") return ok({ status: "ok", version: "2.0.0" });
    if (path === "bookings") {
      if (sp.get("slots") === "true") {
        const date = sp.get("date"), barberId = sp.get("barberId");
        if (!date || !barberId) return err("date and barberId required");
        return ok(await getAvailableSlots(date, barberId));
      }
      const { uid } = await verifyAuth(req);
      return ok(await getUserBookings(uid));
    }
    if (path.startsWith("bookings/") && slug.length === 2) {
      const { uid } = await verifyAuth(req);
      const booking = await getBookingById(slug[1]);
      if (booking.userId !== uid) return err("Unauthorized", 403);
      return ok(booking);
    }
    if (path === "queue") {
      const { uid } = await verifyAuth(req);
      if (sp.get("all") === "true") return ok(await getActiveQueue());
      return ok(await getQueueStatus(uid));
    }
    if (path === "rewards") { const { uid } = await verifyAuth(req); return ok(await getUserRewards(uid)); }
    if (path.startsWith("qr/") && slug.length === 2) {
      const code = slug[1];
      const shopUrl = process.env.NEXT_PUBLIC_SHOP_URL ?? "https://sizabantubarbershop.co.za";
      const url = `${shopUrl}/checkin?code=${encodeURIComponent(code)}`;
      const fmt = sp.get("format") ?? "svg";
      if (fmt === "png") {
        const buf = await QRCode.toBuffer(url, { type: "png", width: 300, margin: 2 });
        return new NextResponse(buf, { headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=86400" } });
      }
      const svg = await QRCode.toString(url, { type: "svg", margin: 2 });
      return new NextResponse(svg, { headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=86400" } });
    }
    if (path === "scheduler") {
      verifySchedulerSecret(req);
      const job = sp.get("job");
      if (job === "expire") return ok(await runExpire());
      if (job === "reminders") return ok(await runReminders());
      return err("job required: expire | reminders");
    }
    return err("Not found", 404);
  } catch (e) { return handleApiError(e); }
}

export async function POST(req: NextRequest, { params }: Ctx) {
  const slug = (await params).slug ?? [];
  const path = p(slug);
  const sp = req.nextUrl.searchParams;
  try {
    if (path === "auth/verify") {
      const { uid, email, phone } = await verifyAuth(req);
      const { displayName } = await req.json().catch(() => ({}));
      const ref = adminDb.collection(COLLECTIONS.USERS).doc(uid);
      const snap = await ref.get();
      if (!snap.exists) await ref.set({ uid, email, phone, displayName, stamps: 0, totalStamps: 0, totalVisits: 0, noShowCount: 0, optedOutWhatsApp: false, joinedAt: Timestamp.now() });
      return ok({ uid, email, phone, displayName, isNew: !snap.exists });
    }
    if (path === "bookings") {
      const { uid } = await verifyAuth(req);
      const { userPhone, userName, barberId, serviceId, serviceName, servicePrice, date, startTime, notes } = await req.json();
      if (!userPhone || !userName || !barberId || !serviceId || !date || !startTime) return err("Missing required fields");
      const booking = await createBooking({ userId: uid, userPhone, userName, barberId, serviceId, serviceName, servicePrice, date, startTime, notes });
      notifyBookingConfirmed({ userId: uid, phone: userPhone, name: userName, date, time: startTime, serviceName }).catch(console.error);
      return ok(booking);
    }
    if (path === "queue") {
      const action = sp.get("action");
      const body = await req.json();
      if (action === "checkin") {
        if (!body.queueCode || !body.sessionToken) return err("queueCode and sessionToken required");
        return ok(await checkIn(body.queueCode, body.sessionToken));
      }
      if (action === "complete") {
        const { uid } = await verifyAuth(req);
        if (!body.entryId) return err("entryId required");
        const entry = await completeSession(body.entryId, uid);
        const { stamps, newRewards } = await addStamp(entry.userId, body.entryId);
        notifySessionCompleted({ userId: entry.userId, phone: entry.userPhone, serviceName: entry.serviceName ?? "" }).catch(console.error);
        if (newRewards?.length) notifyRewardUnlocked({ userId: entry.userId, phone: entry.userPhone, reward: newRewards[0] }).catch(console.error);
        return ok({ entry, stamps, newRewards });
      }
      if (action === "noshow") {
        const { uid } = await verifyAuth(req);
        if (!body.entryId) return err("entryId required");
        return ok(await processNoShow(body.entryId, uid));
      }
      const { uid } = await verifyAuth(req);
      if (!body.userPhone || !body.userName) return err("userPhone and userName required");
      const entry = await joinQueue({ userId: uid, userPhone: body.userPhone, userName: body.userName, serviceId: body.serviceId, serviceName: body.serviceName });
      notifyQueueJoined({ userId: uid, phone: body.userPhone, position: entry.position, estimatedWait: entry.estimatedWaitMinutes }).catch(console.error);
      return ok(entry);
    }
    if (path === "rewards") {
      const { uid } = await verifyAuth(req);
      const { rewardId } = await req.json();
      if (!rewardId) return err("rewardId required");
      return ok(await redeemReward(rewardId, uid));
    }
    if (path === "notifications") {
      verifySchedulerSecret(req);
      const { userId, phone, email, event, templateData, channel } = await req.json();
      if (!userId || !event) return err("userId and event required");
      await sendNotification({ userId, phone, email, event: event as NotificationEvent, templateData, channel });
      return ok({ sent: true });
    }
    if (path === "scheduler") {
      verifySchedulerSecret(req);
      const job = sp.get("job");
      if (job === "expire") return ok(await runExpire());
      if (job === "reminders") return ok(await runReminders());
      return err("job required: expire | reminders");
    }
    return err("Not found", 404);
  } catch (e) { return handleApiError(e); }
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const slug = (await params).slug ?? [];
  const path = p(slug);
  try {
    if (path.startsWith("bookings/") && slug.length === 2) {
      const { uid } = await verifyAuth(req);
      const { action } = await req.json();
      if (action === "cancel") { await cancelBooking(slug[1], uid); return ok({ message: "Booking cancelled" }); }
      if (action === "checkin") return ok(await checkInBooking(slug[1], uid));
      return err("Unknown action. Use: cancel | checkin");
    }
    return err("Not found", 404);
  } catch (e) { return handleApiError(e); }
}

async function runExpire() {
  const [expiredBookings, expiredQueue] = await Promise.all([expireStaleBookings(), expireStaleQueueEntries()]);
  const assigned = await autoAssignBarber().catch(() => null);
  let nextNotified = null;
  if (expiredQueue > 0) {
    const next = await notifyNextInQueue();
    if (next) { await sendNotification({ userId: next.userId, phone: next.userPhone, event: "next_up", templateData: { code: next.queueCode, token: next.sessionToken } }).catch(console.error); nextNotified = next.id; }
  }
  return { expiredBookings, expiredQueue, assigned, nextNotified };
}

async function runReminders() {
  const now = new Date();
  const targetDate = now.toISOString().split("T")[0];
  const m = now.getMinutes() + 10;
  const h = now.getHours() + Math.floor(m / 60);
  const targetTime = `${String(h).padStart(2,"0")}:${String(m%60).padStart(2,"0")}`;
  const snap = await adminDb.collection(COLLECTIONS.BOOKINGS).where("date","==",targetDate).where("startTime","==",targetTime).where("status","in",["confirmed","checked-in"]).get();
  const sent: string[] = [];
  await Promise.all(snap.docs.map(async d => { const b = d.data(); await sendNotification({ userId: b.userId, phone: b.userPhone, event: "reminder_10min", templateData: { name: b.userName, time: targetTime, service: b.serviceName } }).catch(console.error); sent.push(d.id); }));
  return { reminded: sent.length, ids: sent };
}