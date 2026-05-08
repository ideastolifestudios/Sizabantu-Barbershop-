#!/usr/bin/env bash
set -e

REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

echo ">>> Creating app/layout.tsx..."
cat > app/layout.tsx << 'ENDOFFILE'
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sizabantu Barbershop",
  description: "Premium Grooming",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
ENDOFFILE

echo ">>> Creating app/page.tsx..."
cat > app/page.tsx << 'ENDOFFILE'
export default function Home() {
  return (
    <main>
      <h1>Sizabantu Barbershop API</h1>
      <p>Backend is running. See <a href="/api/health">/api/health</a></p>
    </main>
  );
}
ENDOFFILE

echo ">>> Staging and committing..."
git add app/layout.tsx app/page.tsx
git commit -m "fix: add missing app/layout.tsx and app/page.tsx for Next.js app router"

echo ">>> Pushing to origin/main..."
git push origin main

echo ""
echo "✅ Done! Vercel will now redeploy automatically."
echo "   Watch your deployment at: https://vercel.com/dashboard"
