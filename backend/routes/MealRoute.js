// backend/routes/mealorderRoutes.js
import express from "express";
import PlanOrder from "../models/Planorders.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import protect from "../Middleware/authMiddleware.js";

const router = express.Router();

/* -------------------------------------------------
   🔔 Helper: Create + Emit Notification
-------------------------------------------------- */
const sendNotification = async (req, userId, message) => {
  try {
    const notification = await Notification.create({
      userId,
      message,
      time: new Date().toLocaleString(),
    });

    const io = req.app.get("io");
    if (io) {
      io.emit("newNotification", notification);
      io.to(`user_${userId}`).emit("newNotification", notification);
    }

    console.log("📩 Notification sent:", message);
  } catch (err) {
    console.error("❌ Notification send error:", err.message);
  }
};
/* -------------------------------------------------
   🧩 Helper: Auto Status Progression
   scheduled → in-progress → delivered
-------------------------------------------------- */
const autoUpdateStatus = async (order, req) => {
  const createdTime = new Date(order.createdAt).getTime();
  const now = Date.now();
  const diffMinutes = (now - createdTime) / (1000 * 60);

  // ✅ initialize variable safely
  let newStatus = order.status;

  // ⏱ Scheduled → In Progress after 2 minutes
  if (order.status === "scheduled" && diffMinutes >= 2) {
    newStatus = "in-progress";
    await sendNotification(
      req,
      order.userId,
      `🍳 Your ${order.planType} meal is now being prepared!`
    );
  }

  // 📦 In Progress → Delivered after 5 minutes
  if (order.status === "in-progress" && diffMinutes >= 5) {
    newStatus = "delivered";
    await sendNotification(
      req,
      order.userId,
      `📦 Your ${order.planType} meal has been delivered successfully!`
    );
  }

  // ✅ Only save if status actually changed
  if (newStatus !== order.status) {
    order.status = newStatus;
    await order.save();
  }

  return order.status;
};

/* -------------------------------------------------
   🥗 POST /api/mealorder
   Save a new meal order & update user box progress
-------------------------------------------------- */
router.post("/", protect, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { planType, selectedMeals, proteinTarget } = req.body;

    if (!planType || !selectedMeals) {
      return res.status(400).json({ error: "Missing fields: planType or selectedMeals" });
    }

    const newOrder = new PlanOrder({
      userId,
      planType,
      selected: selectedMeals,
      proteinTarget,
    });
    await newOrder.save();

    // ✅ Update user's deliveredBoxes
    const user = await User.findById(userId);
    if (user) {
      user.deliveredBoxes = Math.min(
        (user.deliveredBoxes || 0) + 1,
        user.totalBoxes || 0
      );
      await user.save();
    }

    // 🔔 Notify user
    await sendNotification(
      req,
      userId,
      `✅ Your ${planType} meal customization has been saved successfully!`
    );

    res.status(201).json({
      message: "✅ Meal order saved successfully",
      order: newOrder,
      deliveredBoxes: user?.deliveredBoxes,
      totalBoxes: user?.totalBoxes,
      remainingBoxes: (user?.totalBoxes || 0) - (user?.deliveredBoxes || 0),
    });
  } catch (err) {
    console.error("❌ Error creating meal order:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* -------------------------------------------------
   🧾 GET /api/mealorder/user
   Fetch logged-in user's meal order history
-------------------------------------------------- */
router.get("/user", protect, async (req, res) => {
  try {
    const userId = req.user?.id;
    let orders = await PlanOrder.find({ userId })
      .sort({ createdAt: -1 })
      .select("planType selected status createdAt proteinTarget");

    // ✅ Auto-update each order's status dynamically
    for (let order of orders) {
      await autoUpdateStatus(order, req);
    }

    // Re-fetch after possible updates
    orders = await PlanOrder.find({ userId })
      .sort({ createdAt: -1 })
      .select("planType selected status createdAt proteinTarget");

    res.json({
      message: "✅ User order history fetched",
      count: orders.length,
      orders,
    });
  } catch (err) {
    console.error("❌ Error fetching user orders:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* -------------------------------------------------
   📦 GET /api/mealorder/:id
   Fetch single order details + auto-update status
-------------------------------------------------- */
router.get("/:id", protect, async (req, res) => {
  try {
    const order = await PlanOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    await autoUpdateStatus(order, req);

    res.json(order);
  } catch (err) {
    console.error("❌ Error fetching order:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* -------------------------------------------------
   🔁 POST /api/mealorder/reorder/:orderId
   Duplicate an existing meal order for quick re-scheduling
-------------------------------------------------- */
router.post("/reorder/:orderId", protect, async (req, res) => {
  try {
    const userId = req.user?.id;
    const originalOrder = await PlanOrder.findById(req.params.orderId);
    if (!originalOrder)
      return res.status(404).json({ error: "Original order not found" });

    const newOrder = new PlanOrder({
      userId,
      planType: originalOrder.planType,
      selected: originalOrder.selected,
      proteinTarget: originalOrder.proteinTarget,
      status: "scheduled",
    });
    await newOrder.save();

    const user = await User.findById(userId);
    if (user) {
      user.deliveredBoxes = Math.min(
        (user.deliveredBoxes || 0) + 1,
        user.totalBoxes || 0
      );
      await user.save();
    }

    // 🔔 Notify user about reorder
    await sendNotification(
      req,
      userId,
      `🔁 Your ${originalOrder.planType} meal has been re-scheduled successfully!`
    );

    res.status(201).json({
      message: "✅ Reorder placed successfully",
      newOrder,
      deliveredBoxes: user?.deliveredBoxes,
      totalBoxes: user?.totalBoxes,
      remainingBoxes: (user?.totalBoxes || 0) - (user?.deliveredBoxes || 0),
    });
  } catch (err) {
    console.error("❌ Error processing reorder:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
