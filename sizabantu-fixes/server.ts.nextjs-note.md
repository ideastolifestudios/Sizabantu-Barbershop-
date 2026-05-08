# server.ts — Not needed for Next.js on Vercel

The original server.ts used Express + Socket.IO for real-time updates.

**Why it was removed:**
- Vercel is **serverless** — no persistent Node.js server, so Socket.IO can't run
- Next.js App Router handles all API routes natively
- Real-time updates are now handled by **Firestore `onSnapshot` listeners** in `lib/hooks/useQueue.ts`

**How real-time works now:**
```typescript
// In your React component, the useQueue hook automatically subscribes
// to Firestore changes in real-time — zero polling, zero sockets needed:

import { useQueue } from "@/lib/hooks/useQueue";

export function QueueDisplay() {
  const { myEntry } = useQueue(); // ← auto-updates when Firestore changes
  return <div>Position: {myEntry?.position}</div>;
}
```

**If you need Railway deployment** (not Vercel), the original server.ts.bak is preserved.
