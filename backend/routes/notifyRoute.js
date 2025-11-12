import express from "express";
import Notification from "../models/Notification.js";

const router = express.Router();

/* ===========================================================
   📩 Create New Notification
   POST /api/notifications
   Body: { userId, message }
   Emits: "newNotification" (via Socket.io)
=========================================================== */
router.post("/", async (req, res) => {
  try {
    const { userId, message } = req.body;

    if (!userId || !message) {
      return res.status(400).json({ message: "❌ Missing userId or message" });
    }

    const notification = await Notification.create({
      userId,
      message,
      isRead: false,
      time: new Date().toLocaleString(),
    });

    // 🔔 Real-time broadcast if socket.io is available
    if (req.io) {
      req.io.emit("newNotification", notification);
    }

    res.status(201).json(notification);
  } catch (err) {
    console.error("❌ Notification creation error:", err);
    res.status(500).json({ message: "Failed to create notification" });
  }
});

/* ===========================================================
   📬 Get All Notifications for a User
   GET /api/notifications/:userId
=========================================================== */
router.get("/:userId", async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.params.userId })
      .sort({ createdAt: -1 }); // ✅ Requires timestamps in schema

    res.json(Array.isArray(notifications) ? notifications : []);
  } catch (err) {
    console.error("❌ Fetch notifications error:", err);
    res.status(500).json({ message: "Server error while fetching notifications" });
  }
});

/* ===========================================================
   🟢 Mark Notification as Read
   PUT /api/notifications/read/:id
=========================================================== */
router.put("/read/:id", async (req, res) => {
  try {
    const updated = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json(updated);
  } catch (err) {
    console.error("❌ Mark as read error:", err);
    res.status(500).json({ message: "Server error while marking notification read" });
  }
});

export default router;
