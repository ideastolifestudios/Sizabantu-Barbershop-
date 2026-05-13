# Sizabantu Barbershop OS

Premium barbershop management system for Sizabantu Barbershop — Klipfontein View, Midrand, Gauteng.

## Overview

A full-stack Next.js application providing:
- Online booking (scheduled appointments + walk-in queue)
- Real-time queue management
- Loyalty stamp programme
- Admin dashboard
- WhatsApp & email notifications

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Auth | Firebase Authentication (Google OAuth) |
| Database | Firestore |
| Notifications | Wassenger (WhatsApp), Resend (Email) |
| Deployment | Vercel |

## Prerequisites

- Node.js 18+
- Firebase project (Firestore + Auth enabled)
- Vercel account

## Local Setup

```bash
git clone https://github.com/ideastolifestudios/Sizabantu-Barbershop-.git
cd Sizabantu-Barbershop-
npm install
cp .env.example .env.local
# Fill in your credentials in .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

See `.env.example` for all required variables. Set them in Vercel → Project → Settings → Environment Variables.

| Variable | Description |
|----------|-------------|
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Firebase Admin SDK credentials (minified JSON) |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Client SDK key |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID |
| `WASSENGER_API_KEY` | WhatsApp messaging API key |
| `RESEND_API_KEY` | Email delivery API key |
| `SCHEDULER_SECRET` | Secret for internal cron job authentication |
| `ALLOWED_ORIGIN` | Allowed CORS origin (production domain) |

## Project Structure

```
app/
  api/          # Next.js API routes (bookings, queue, auth, rewards)
  page.tsx      # Main frontend (React client component)
  layout.tsx    # Root layout
lib/
  firebase/     # Firebase Admin + Client SDK setup
  services/     # Business logic (booking, queue, rewards, notifications)
  types/        # Shared TypeScript types
  utils/        # Helpers (auth, API)
```

## Deployment

Automatic deploys via Vercel on push to `main`. No manual steps required.

## Business Hours

Tuesday – Sunday: 09:00 – 18:00  
Closed Mondays.

## Contact

📍 Klipfontein View 644, Nancy Ndamase Street, Midrand  
📞 +27 60 724 6829  
📸 [@sizabantub](https://www.instagram.com/sizabantub/)

---

© 2026 Sizabantu Barbershop. All rights reserved.
