import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ─── Image Optimization ────────────────────────────────────────
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [390, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    remotePatterns: [
      // Add any external image sources here
      // { protocol: "https", hostname: "**.example.com" },
    ],
  },

  // ─── Compression ───────────────────────────────────────────────
  compress: true,

  // ─── Security Headers ──────────────────────────────────────────
  async headers() {
    const securityHeaders = [
      { key: "X-DNS-Prefetch-Control",    value: "on" },
      { key: "X-Frame-Options",           value: "SAMEORIGIN" },
      { key: "X-Content-Type-Options",    value: "nosniff" },
      { key: "Referrer-Policy",           value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy",        value: "camera=(), microphone=(), geolocation=(self)" },
    ];

    const corsHeaders = [
      { key: "Access-Control-Allow-Origin",  value: process.env.ALLOWED_ORIGIN || "https://sizabantubarbershop.co.za" },
      { key: "Access-Control-Allow-Methods", value: "GET,POST,PATCH,DELETE,OPTIONS" },
      { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization, x-scheduler-secret" },
    ];

    return [
      { source: "/(.*)", headers: securityHeaders },
      { source: "/api/:path*", headers: corsHeaders },
    ];
  },

  // ─── Redirects ─────────────────────────────────────────────────
  async redirects() {
    return [
      // Redirect www → non-www (Vercel handles this but good to have)
      // { source: "/:path*", has: [{ type: "host", value: "www.sizabantubarbershop.co.za" }], destination: "https://sizabantubarbershop.co.za/:path*", permanent: true },
    ];
  },

  // ─── Experimental ──────────────────────────────────────────────
  experimental: {
    optimizeCss: true,
    serverActions: {
      allowedOrigins: [
        "sizabantubarbershop.co.za",
        "localhost:3000",
      ],
    },
  },

  // ─── TypeScript ────────────────────────────────────────────────
  typescript: {
    // Set to false to fail builds on type errors (recommended for production)
    ignoreBuildErrors: false,
  },

  // ─── Logging ───────────────────────────────────────────────────
  logging: {
    fetches: { fullUrl: process.env.NODE_ENV === "development" },
  },
};

export default nextConfig;
