import type { Timestamp } from "firebase-admin/firestore";

// ─── Booking ────────────────────────────────────────────────────
export type BookingStatus =
  | "pending" | "confirmed" | "checked-in" | "in-progress"
  | "completed" | "cancelled" | "expired";

export interface Booking {
  id: string;
  userId: string;
  userPhone: string;
  userName: string;
  barberId: string;
  serviceId: string;
  serviceName: string;
  servicePrice: number;   // ZAR in cents (e.g. 5000 = R50)
  date: string;           // "YYYY-MM-DD"
  startTime: string;      // "HH:MM"
  endTime: string;        // "HH:MM"
  status: BookingStatus;
  notes?: string;
  qrCode?: string;        // data URL for QR image
  createdAt: Timestamp;
  updatedAt: Timestamp;
  confirmedAt?: Timestamp;
  completedAt?: Timestamp;
}

// ─── Queue ──────────────────────────────────────────────────────
export type QueueStatus =
  | "waiting" | "notified" | "checked-in" | "serving"
  | "completed" | "expired" | "skipped";

export interface QueueEntry {
  id: string;
  userId: string;
  userPhone: string;
  userName: string;
  queueCode: string;        // "SZB-042"
  sessionToken: string;     // "XK7P2A"
  barberId?: string;
  serviceId?: string;
  serviceName?: string;
  position: number;
  estimatedWaitMinutes: number;
  status: QueueStatus;
  joinedAt: Timestamp;
  notifiedAt?: Timestamp;
  checkedInAt?: Timestamp;
  servingStartedAt?: Timestamp;
  completedAt?: Timestamp;
  expiresAt: Timestamp;     // 15 min after notification
}

// ─── Session ────────────────────────────────────────────────────
export interface Session {
  id: string;
  queueEntryId: string;
  bookingId?: string;
  barberId: string;
  userId: string;
  startedAt: Timestamp;
  completedAt?: Timestamp;
  durationMinutes?: number;
}

// ─── User ───────────────────────────────────────────────────────
export interface UserProfile {
  uid: string;
  email?: string;
  phone?: string;
  displayName?: string;
  stamps: number;          // current card (resets after 10)
  totalStamps: number;     // all-time
  totalVisits: number;
  noShowCount: number;
  joinedAt: Timestamp;
  lastVisitAt?: Timestamp;
  optedOutWhatsApp: boolean;
}

// ─── Rewards ────────────────────────────────────────────────────
export type RewardType = "FREE_CAP" | "FREE_HAIRCUT";

export interface Reward {
  id: string;
  userId: string;
  type: RewardType;
  stampMilestone: number;   // 5 or 10
  earnedAt: Timestamp;
  redeemedAt?: Timestamp;
  redeemed: boolean;
  sessionId?: string;
}

// ─── Notification ────────────────────────────────────────────────
export type NotificationEvent =
  | "booking_confirmed" | "booking_cancelled" | "queue_joined"
  | "queue_position_update" | "next_up" | "reminder_10min"
  | "session_started" | "session_completed" | "session_expired"
  | "no_show" | "reward_unlocked";

export interface NotificationRecord {
  id: string;
  userId: string;
  phone?: string;
  email?: string;
  event: NotificationEvent;
  channel: "whatsapp" | "sms" | "email" | "in-app";
  status: "sent" | "failed" | "pending" | "retry";
  message: string;
  retryCount: number;
  sentAt?: Timestamp;
  createdAt: Timestamp;
  metadata?: Record<string, unknown>;
}

// ─── Service & Barber ────────────────────────────────────────────
export interface BarberService {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
  category: string;
  active: boolean;
}

export interface Barber {
  id: string;
  name: string;
  active: boolean;
  currentQueueEntryId?: string;
  totalServiced: number;
}

// ─── API Helpers ─────────────────────────────────────────────────
export interface ApiSuccess<T = unknown> { success: true; data: T; }
export interface ApiError { success: false; error: string; code?: string; }
export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;

// ─── Reward Ledger (missing from initial sync) ───────────────────────────────
export interface RewardLedger {
  uid: string;
  stamps: number;
  totalStamps: number;
  rewards: Reward[];
  pendingRewards: Reward[];
}
