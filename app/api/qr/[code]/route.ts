import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";

export async function GET(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const shopUrl = process.env.NEXT_PUBLIC_SHOP_URL || "https://sizabantubarbershop.co.za";
  const checkInUrl = `${shopUrl}/checkin?code=${encodeURIComponent(code)}`;

  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format") || "svg";

  if (format === "png") {
    const buffer = await QRCode.toBuffer(checkInUrl, { type: "png", width: 300, margin: 2 });
    return new NextResponse(buffer, { headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=86400" } });
  }

  const svg = await QRCode.toString(checkInUrl, { type: "svg", margin: 2 });
  return new NextResponse(svg, { headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=86400" } });
}
