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
    if (path === "health" || path === "") return ok({ status: "ok", version: "2.0.3" });
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
      const body = await req.json();
      const booking = await createBooking({ userId: uid, ...body });
      notifyBookingConfirmed({ 
        userId: uid, phone: body.userPhone, name: body.userName, 
        date: body.date, time: body.startTime, service: body.serviceName, bookingId: booking.id 
      }).catch(console.error);
      return ok(booking);
    }
    if (path === "queue") {
      const action = sp.get("action");
      const body = await req.json();
      if (action === "checkin") return ok(await checkIn(body.queueCode, body.sessionToken));
      if (action === "complete") {
        const { uid: adminUid } = await verifyAuth(req);
        const entry = await completeSession(body.entryId, adminUid);
        const { stamps } = await addStamp(entry.userId, body.entryId);
        notifySessionCompleted({ userId: entry.userId, phone: entry.userPhone, name: entry.userName, stamps: String(stamps) }).catch(console.error);
        return ok({ entry, stamps });
      }
      const { uid } = await verifyAuth(req);
      const entry = await joinQueue({ userId: uid, ...body });
      notifyQueueJoined({ 
        userId: uid, phone: body.userPhone, name: body.userName,
        code: entry.queueCode, position: String(entry.position), 
        wait: String(entry.estimatedWaitMinutes), token: entry.sessionToken
      }).catch(console.error);
      return ok(entry);
    }
    if (path === "scheduler") {
      verifySchedulerSecret(req);
      const job = sp.get("job");
      if (job === "expire") return ok(await expireStaleQueueEntries());
      return err("Unknown job");
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
      if (action === "cancel") { await cancelBooking(slug[1], uid); return ok({ msg: "ok" }); }
      if (action === "checkin") return ok(await checkInBooking(slug[1], uid));
    }
    return err("Not found", 404);
  } catch (e) { return handleApiError(e); }
}