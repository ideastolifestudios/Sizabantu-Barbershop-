import { NextResponse } from "next/server";

export const ok = <T>(data: T, status = 200) =>
  NextResponse.json({ success: true, data }, { status });

export const err = (error: string, status = 400, code?: string) =>
  NextResponse.json({ success: false, error, code }, { status });

export function handleApiError(e: unknown): NextResponse {
  const message = e instanceof Error ? e.message : "Internal server error";
  console.error("[API]", message);
  if (message.startsWith("Unauthorized")) return err(message, 401, "UNAUTHORIZED");
  if (message.includes("not found")) return err(message, 404, "NOT_FOUND");
  if (message.includes("already") || message.includes("conflict")) return err(message, 409, "CONFLICT");
  return err(message, 500, "SERVER_ERROR");
}
