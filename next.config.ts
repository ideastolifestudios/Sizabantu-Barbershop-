import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // ─── Server External Packages ─────────────────────────────────
  // Prevents webpack from trying to bundle firebase-admin (Node-only SDK)
  serverExternalPackages: ["firebase-admin"],

  // ─── Image Optimization ────────────────────────────────────────
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [390, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [],
  },

  compress: true,

  // ─── Security Headers ──────────────────────────────────────────
  async headers() {
    const securityHeaders = [
      { key: "X-DNS-Prefetch-Control",  value: "on" },
      { key: "X-Frame-Options",          value: "SAMEORIGIN" },
      { key: "X-Content-Type-Options",   value: "nosniff" },
      { key: "Referrer-Policy",          value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy",       value: "camera=(), microphone=(), geolocation=(self)" },
    ];
    const corsHeaders = [
      { key: "Access-Control-Allow-Origin",  value: process.env.ALLOWED_ORIGIN || "https://sizabantubarbershop.co.za" },
      { key: "Access-Control-Allow-Methods", value: "GET,POST,PATCH,DELETE,OPTIONS" },
      { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization, x-scheduler-secret" },
    ];
    return [
      { source: "/(.*)",      headers: securityHeaders },
      { source: "/api/:path*", headers: corsHeaders },
    ];
  },

  async redirects() {
    return [];
  },

  // ─── Experimental ─────────────────────────────────────────────
  // Removed optimizeCss (experimental, can interfere with module resolution)
  experimental: {
    serverActions: {
      allowedOrigins: ["sizabantubarbershop.co.za", "localhost:3000"],
    },
  },

  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  logging: {
    fetches: { fullUrl: process.env.NODE_ENV === "development" },
  },

  // ─── Webpack ───────────────────────────────────────────────────
  // Explicit alias so @ always maps to project root,
  // regardless of src/ directory auto-detection or tsconfig parsing quirks
  webpack: (config) => {
    config.resolve.alias["@"] = path.resolve(__dirname);
    return config;
  },
};

export default nextConfig;
