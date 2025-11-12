import Order from "../models/Order.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";

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

    // ✅ Emit real-time via Socket.io
    const io = req.app.get("io");
    if (io) {
      io.emit("newNotification", notification); // broadcast to all
      io.to(`user_${userId}`).emit("newNotification", notification); // private
    }

    console.log(`📩 Notification sent: ${message}`);
  } catch (err) {
    console.error("❌ Notification send error:", err.message);
  }
};

/* -------------------------------------------------
   🚀 Place Quick Order
-------------------------------------------------- */
export const placeQuickOrder = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: user not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { mealType, items, address, paymentMethod, phone } = req.body;

    if (!mealType || !items?.length || !address || !phone) {
      return res.status(400).json({
        message: "Missing required fields (including phone)",
      });
    }

    // 💰 Calculate subtotal
    const subtotal = items.reduce(
      (acc, item) => acc + (item.price || 0) * (item.quantity || 1),
      0
    );

    // 🚚 Delivery charge (waived for premium users)
    let deliveryCharge = 0;
    if (!user?.isPremium) {
      if (subtotal < 200) deliveryCharge = 30;
      else if (subtotal < 500) deliveryCharge = 20;
      else deliveryCharge = 0;
    }

    const totalAmount = subtotal + deliveryCharge;

    // 🧾 Create order
    const order = await Order.create({
      user: { id: user._id, name: user.name, email: user.email },
      mealType,
      items,
      address,
      phone,
      paymentMethod,
      subtotal,
      deliveryCharge,
      total: totalAmount,
    });

    // 🔗 Link order to user
    await User.findByIdAndUpdate(userId, { $push: { orders: order._id } });

    // 🔔 Create + emit notification
    await sendNotification(
      req,
      userId,
      `✅ Your order #${order._id} has been placed successfully!`
    );

    // 📡 Emit real-time order event
    const io = req.app.get("io");
    if (io) {
      io.emit("orderCreated", order);
      io.to(`user_${userId}`).emit("orderCreated", order);
    }

    res.json({
      success: true,
      message: "✅ Quick order placed successfully!",
      order,
    });
  } catch (err) {
    console.error("Quick order error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};

/* -------------------------------------------------
   📜 Fetch User Orders
-------------------------------------------------- */
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user?.id;
    const orders = await Order.find({ "user.id": userId }).sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (err) {
    console.error("Get user orders error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* -------------------------------------------------
   ❌ Cancel Order (within 3 minutes)
-------------------------------------------------- */
export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const order = await Order.findOne({ _id: id, "user.id": userId });
    if (!order) return res.status(404).json({ message: "Order not found" });

    // ⏳ Check cancellation window (3 mins)
    const timeDiff = Date.now() - new Date(order.createdAt).getTime();
    if (timeDiff > 3 * 60 * 1000) {
      return res.status(400).json({ message: "Cancellation window expired" });
    }

    order.status = "cancelled";
    await order.save();

    // 🔔 Notify user
    await sendNotification(req, userId, `❌ Your order #${order._id} has been cancelled.`);

    // 📡 Emit live events
    const io = req.app.get("io");
    if (io) {
      io.emit("orderCancelled", order);
      io.to(`user_${userId}`).emit("orderCancelled", order);
    }

    res.json({
      success: true,
      message: "Order cancelled successfully.",
      order,
    });
  } catch (err) {
    console.error("❌ Cancel order error:", err);
    res.status(500).json({ message: "Server error during order cancellation" });
  }
};
