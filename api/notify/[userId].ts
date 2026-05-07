// POST /api/notify/:userId
// Replaces socket.io emit with a Firestore write.
// Frontend reads it via onSnapshot on /notifications collection.
import { admin, db } from "../_lib/firebase.js";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { userId } = req.query ?? {};
  const { message } = req.body ?? {};

  if (!userId || !message) {
    return res.status(400).json({ error: "userId and message required" });
  }

  await db.collection("notifications").add({
    userId,
    message,
    read: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  res.json({ success: true });
}
