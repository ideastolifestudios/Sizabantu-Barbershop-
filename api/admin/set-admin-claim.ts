// POST /api/admin/set-admin-claim
// One-time setup: set Firebase Custom Claims for admin users.
// Call this ONCE for cbrprints22@gmail.com and any @sizabantubarbershop.co.za emails.
// Protected by ADMIN_SETUP_SECRET env var.

import { admin } from "../_lib/firebase.js";

const ADMIN_EMAILS = [
  "cbrprints22@gmail.com",
  // Add @sizabantubarbershop.co.za accounts here
];

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // Protect this endpoint with a secret
  const secret = req.headers["x-setup-secret"];
  if (secret !== process.env.ADMIN_SETUP_SECRET) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const { email } = req.body ?? {};
  if (!email) return res.status(400).json({ error: "email required" });

  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(userRecord.uid, { role: "admin" });

    // Also update Firestore
    await admin.firestore()
      .collection("users")
      .doc(userRecord.uid)
      .update({ role: "admin" });

    res.json({ success: true, message: `Admin claim set for ${email}` });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
}
