import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export async function GET() {
  let firestore = "ok";
  try {
    await adminDb.collection("_health").limit(1).get();
  } catch { firestore = "error"; }

  const status = firestore === "ok" ? 200 : 503;
  return NextResponse.json({
    status: status === 200 ? "healthy" : "degraded",
    firestore,
    timestamp: new Date().toISOString(),
    version: "2.0.0",
  }, { status });
}
