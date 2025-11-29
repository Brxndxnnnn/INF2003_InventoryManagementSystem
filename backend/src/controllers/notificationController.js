import { getDb } from "../mongoClient.js";
import { ObjectId } from "mongodb";

// Create notification
export const createNotification = async ({
  user_id,          // REQUIRED
  type,             // e.g. "ORDER_PLACED", "LOW_STOCK"
  message,
  payload = {},     // optional: { shop_id, order_id, product_id, supplier_id }
}) => {
  const db = getDb();
  const col = db.collection("notifications");

  await col.insertOne({
    user_id,
    type,
    message,
    payload,
    read: false,
    created_at: new Date(),
  });
};

export const getNotificationsForUser = async (req, res) => {
  const { user_id } = req.params;

  try {
    const db = getDb();
    const col = db.collection("notifications");

    const docs = await col
      .find({ user_id: Number(user_id) })
      .sort({ created_at: -1 })
      .limit(50)
      .toArray();

    res.status(200).json(docs);
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ message: err.message });
  }
};

export const markAllNotificationsReadForUser = async (req, res) => {
  const { user_id } = req.params;

  try {
    const db = getDb();
    const col = db.collection("notifications");

    const result = await col.updateMany(
      { user_id: Number(user_id), read: false },
      { $set: { read: true } }
    );

    res.status(200).json({
      message: "All notifications marked as read",
      modifiedCount: result.modifiedCount,
    });
  } catch (err) {
    console.error("Error marking notifications read:", err);
    res.status(500).json({ message: err.message });
  }
};

export const deleteNotification = async (req, res) => {
  const { id } = req.params;

  try {
    const db = getDb();
    const col = db.collection("notifications");

    const result = await col.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (err) {
    console.error("Error deleting notification:", err);
    res.status(500).json({ message: err.message });
  }
};
