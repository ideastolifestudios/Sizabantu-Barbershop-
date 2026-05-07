import { admin, db } from "../_lib/firebase.js";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { email, otp } = req.body ?? {};
  if (!email || !otp) return res.status(400).json({ error: "email and otp required" });

  const doc = await db.collection("otps").doc(email).get();
  if (!doc.exists) return res.status(401).json({ error: "Invalid or expired code" });

  const { code, expires } = doc.data()!;
  const now = admin.firestore.Timestamp.now();

  if (code !== otp || expires.toMillis() < now.toMillis()) {
    return res.status(401).json({ error: "Invalid or expired code" });
  }

  // Delete used OTP
  await doc.ref.delete();

  try {
    const userRecord = await admin
      .auth()
      .getUserByEmail(email)
      .catch(async () => admin.auth().createUser({ email }));

    const customToken = await admin.auth().createCustomToken(userRecord.uid, {
      email,
      email_verified: true,
    });

    res.json({ success: true, customToken });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
}
