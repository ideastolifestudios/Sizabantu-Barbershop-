import { admin, db } from "../_lib/firebase.js";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { code } = req.body ?? {};
  if (!code) return res.status(400).json({ error: "code required" });

  const snap = await db
    .collection("bookings")
    .where("verificationCode", "==", code)
    .where("status", "in", ["confirmed", "pending"])
    .limit(1)
    .get();

  if (snap.empty) return res.status(404).json({ error: "Invalid or inactive code" });

  const bookingDoc = snap.docs[0];
  await bookingDoc.ref.update({
    status: "checked-in",
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  res.json({ success: true, booking: { id: bookingDoc.id, ...bookingDoc.data() } });
}
