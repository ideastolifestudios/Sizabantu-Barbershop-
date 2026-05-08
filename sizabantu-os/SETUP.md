# Sizabantu Barbershop OS — Setup Guide

## Prerequisites
- Node.js 20+
- Firebase project with Auth + Firestore enabled
- Wassenger account (https://app.wassenger.com) for WhatsApp

---

## 1. Clone and install

```bash
# If upgrading existing repo:
cd Sizabantu-Barbershop-

# Install dependencies (the new stack is Next.js 15 + Firebase Admin)
npm install

# Or if starting fresh:
git clone https://github.com/ideastolifestudios/Sizabantu-Barbershop-
cd Sizabantu-Barbershop-
npm install
```

---

## 2. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in:

### Firebase Admin (Server)
1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Minify to one line: `jq -c . < your-key.json`
5. Paste as `FIREBASE_SERVICE_ACCOUNT_JSON`

### Firebase Client (Browser)
From Firebase Console → Project Settings → Your apps → Web app:
- Copy all `NEXT_PUBLIC_FIREBASE_*` values

### Wassenger (WhatsApp)
1. Sign up at https://app.wassenger.com
2. Connect your WhatsApp (scan QR)
3. Go to Settings → API Keys → create a key
4. Set `WASSENGER_API_KEY`
5. Set `WASSENGER_DEVICE_PHONE` to your connected number (no +)

### Scheduler Secret
```bash
openssl rand -hex 32
# Paste output as SCHEDULER_SECRET
```

---

## 3. Deploy Firestore rules

```bash
# Install Firebase CLI if needed
npm install -g firebase-tools

firebase login
firebase use YOUR_PROJECT_ID

# Deploy the security rules
firebase deploy --only firestore:rules
```

---

## 4. Seed Firestore with barbers + services

Run this once in your Firebase Console → Firestore → add documents:

**Collection: `barbers`**
```json
{ "name": "Main Barber", "active": true, "totalServiced": 0 }
```

**Collection: `services`**
```json
{ "name": "Fade", "price": 5000, "durationMinutes": 30, "category": "Haircuts", "active": true }
{ "name": "Brush", "price": 3500, "durationMinutes": 30, "category": "Haircuts", "active": true }
{ "name": "Chiskop", "price": 3000, "durationMinutes": 30, "category": "Haircuts", "active": true }
```
> Prices are in cents (5000 = R50)

---

## 5. Run locally

```bash
npm run dev
# → http://localhost:3000
```

---

## 6. Deploy to Vercel

```bash
# Link to your Vercel project
npx vercel

# Set env vars in Vercel dashboard: 
# vercel.com → your project → Settings → Environment Variables

# Deploy to production
npx vercel --prod
```

The `vercel.json` cron jobs run automatically:
- `/api/scheduler/reminders` every 5 min — sends 10-min reminder WhatsApps
- `/api/scheduler/expire` every 10 min — expires no-shows, advances queue

---

## 7. API Quick Reference

All endpoints use `Authorization: Bearer <firebase_id_token>`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/verify` | Create/sync user profile after login |
| GET | `/api/bookings` | Get user's bookings |
| POST | `/api/bookings` | Create booking |
| PATCH | `/api/bookings/[id]` | Cancel or check-in a booking |
| GET | `/api/bookings/slots?date=&barberId=` | Available slots |
| POST | `/api/queue` | Join the live queue |
| GET | `/api/queue/status` | Get user's queue position |
| POST | `/api/queue/checkin` | Check in with code + token |
| POST | `/api/queue/complete` | Complete session (barber action) |
| POST | `/api/queue/noshow` | Process no-show (barber action) |
| GET | `/api/rewards` | Get user's stamps + rewards |
| POST | `/api/rewards/redeem` | Redeem a reward |
| GET | `/api/qr/[code]` | Generate QR code image (PNG or SVG) |
| GET | `/api/health` | Health check |

---

## 8. WhatsApp Notifications

Messages sent automatically on:
- ✅ Booking confirmed
- 🔔 You're next in queue
- ⏰ 10-min appointment reminder
- ✨ Session complete + stamps count
- 🎁 Reward unlocked (free cap / free haircut)
- 😕 No-show / queue expired

---

## 9. Rewards Logic

| Stamps | Reward |
|--------|--------|
| 5 | Free Cap |
| 10 | Free Haircut (stamps reset to 0) |

Stamps are awarded automatically when a session is completed via `/api/queue/complete`.

---

## Troubleshooting

**Firebase Admin error:** Ensure `FIREBASE_SERVICE_ACCOUNT_JSON` is valid JSON, minified to one line.  
**WhatsApp not sending:** Check `WASSENGER_API_KEY` and that your device is connected in the Wassenger dashboard.  
**Cron jobs not running:** Vercel crons require a Pro plan. Use an external cron service (e.g. Upstash QStash) to hit the scheduler endpoints with the `x-scheduler-secret` header.

---

Built with Next.js 15 · Firebase · Wassenger · CodeWords OS v2.0
