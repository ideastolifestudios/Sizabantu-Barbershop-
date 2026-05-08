import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  if (request.method === "OPTIONS") {
    const res = new NextResponse(null, { status: 204 });
    const origin = process.env.ALLOWED_ORIGIN || "https://sizabantubarbershop.co.za";
    res.headers.set("Access-Control-Allow-Origin", origin);
    res.headers.set("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
    res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, x-scheduler-secret");
    res.headers.set("Access-Control-Max-Age", "86400");
    return res;
  }
  return NextResponse.next();
}

export const config = { matcher: "/api/:path*" };
