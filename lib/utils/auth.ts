import { adminAuth } from "@/lib/firebase/admin";
import type { NextRequest } from "next/server";

export interface AuthPayload { uid: string; email?: string; phone?: string; }

export async function verifyAuth(req: NextRequest): Promise<AuthPayload> {
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) throw new Error("Unauthorized: missing token");
  const decoded = await adminAuth.verifyIdToken(auth.slice(7)).catch(() => {
    throw new Error("Unauthorized: invalid or expired token");
  });
  return { uid: decoded.uid, email: decoded.email, phone: decoded.phone_number };
}

export function verifySchedulerSecret(req: NextRequest): void {
  if (req.headers.get("x-scheduler-secret") !== process.env.SCHEDULER_SECRET) {
    throw new Error("Unauthorized: invalid scheduler secret");
  }
}
