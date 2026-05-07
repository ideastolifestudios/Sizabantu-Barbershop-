// OTP stored in Firestore with 10-min expiry (replaces in-memory Map)
import { admin, db } from "../_lib/firebase.js";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { email } = req.body ?? {};
  if (!email) return res.status(400).json({ error: "email required" });

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = admin.firestore.Timestamp.fromDate(
    new Date(Date.now() + 10 * 60 * 1000)
  );

  await db.collection("otps").doc(email).set({ code, expires });

  // In production: send code via email/SMS
  console.log(`[AUTH] OTP for ${email}: ${code}`);

  res.json({ success: true });
}
