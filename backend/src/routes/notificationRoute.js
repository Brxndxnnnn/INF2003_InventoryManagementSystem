import express from "express";
import {
  getNotificationsForUser,
  markAllNotificationsReadForUser,
  deleteNotification,
  createNotification
} from "../controllers/notificationController.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    await createNotification(req.body);
    res.status(201).json({ message: "Notification created" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/user/:user_id", getNotificationsForUser);
router.patch("/user/:user_id/read-all", markAllNotificationsReadForUser);
router.delete("/:id", deleteNotification);

export default router;
