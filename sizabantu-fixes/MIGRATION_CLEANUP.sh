#!/bin/bash
# Run this ONCE from your repo root to clean up Vite → Next.js migration

echo "🧹 Cleaning up Vite config conflicts..."

# Rename (not delete) old Vite config so Vercel detects Next.js
# Keeping as .bak so you can reference if needed
if [ -f "vite.config.ts" ]; then
  mv vite.config.ts vite.config.ts.bak
  echo "  ✓ Renamed vite.config.ts → vite.config.ts.bak"
fi

# Rename old index.html (Vite entry point — conflicts with Next.js)
if [ -f "index.html" ]; then
  mv index.html index.html.vite.bak
  echo "  ✓ Renamed index.html → index.html.vite.bak (Vite entry — not needed for Next.js)"
fi

# Rename server.ts (Express + Socket.IO — not needed, Vercel is serverless)
if [ -f "server.ts" ]; then
  mv server.ts server.ts.bak
  echo "  ✓ Renamed server.ts → server.ts.bak (Socket.IO server — replaced by Firestore listeners)"
fi

echo ""
echo "✅ Done! Now run:"
echo "   git add ."
echo "   git commit -m 'fix: remove Vite/Socket.IO conflicts for Next.js on Vercel'"
echo "   git push origin main"
echo ""
echo "Then in Vercel dashboard:"
echo "  → Project Settings → General → Framework Preset → Next.js"
echo "  → Redeploy"
