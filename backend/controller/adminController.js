// controller/adminController.js
import Admin from "../models/admin.js";
import Order from "../models/Order.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: admin._id, role: "admin" }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // ✅ Send token in an HttpOnly cookie
    res.cookie("adminToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // true for HTTPS
    //   sameSite: "strict",
    sameSite: "lax",


      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({ success: true, token, admin });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getDashboardData = async (req, res) => {
  try {
    const orders = await Order.find().populate("user", "name email");

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + (o.price || o.total || 0), 0);
    const deliveredOrders = orders.filter((o) => (o.status || "").toLowerCase() === "delivered").length;

    const uniqueUsers = new Set(
      orders.map((o) => o.user?._id?.toString()).filter(Boolean)
    ).size;

    // 🔥 Monthly or 7-day revenue breakdown (for chart)
    const dailyMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString("en-GB");
      dailyMap[key] = { date: key, revenue: 0, orders: 0 };
    }

    orders.forEach((o) => {
      const key = new Date(o.createdAt).toLocaleDateString("en-GB");
      if (!dailyMap[key]) dailyMap[key] = { date: key, revenue: 0, orders: 0 };
      dailyMap[key].revenue += Number(o.price || o.total || 0);
      dailyMap[key].orders += 1;
    });

    const monthlyRevenue = Object.values(dailyMap);

    // Prepare recent orders
    const recentOrders = orders
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10)
      .map((o) => ({
        _id: o._id,
        customerName: o.user?.name || "Unknown",
        price: o.price || o.total || 0,
        status: o.status,
        createdAt: o.createdAt,
      }));

    res.json({
      stats: {
        orders: totalOrders,
        users: uniqueUsers,
        revenue: Number(totalRevenue.toFixed(2)),
        delivered: deliveredOrders,
        monthlyRevenue, // ✅ added for chart
      },
      orders: recentOrders,
    });
  } catch (error) {
    console.error("Dashboard data error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// -----------------------------------------
// 🚪 Admin Logout
// -----------------------------------------
export const adminLogout = async (req, res) => {
  try {
    res.clearCookie("adminToken");
    res.json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ message: "Server error" });
  }
};



// Fetching All users Orders
export const getAllOrders = async (req, res) => {
  try {
    // You can filter if needed: only admin can access this anyway
    const orders = await Order.find().populate("user", "name email");
    res.json({ success: true, orders });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// 👥 Get All Users
// -------------------------
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "-password").sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) {
    console.error("getAllUsers error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// -------------------------
// 🚫 Block / Unblock User
// -------------------------
export const toggleBlockUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { blocked } = req.body;

    const user = await User.findByIdAndUpdate(id, { blocked }, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ success: true, user });
  } catch (err) {
    console.error("toggleBlockUser error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// -------------------------
// 🗑️ Delete User
// -------------------------
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Remove user
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Remove related orders
    await Order.deleteMany({ user: id });

    res.json({ success: true, message: "User and related orders deleted" });
  } catch (err) {
    console.error("deleteUser error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// -------------------------
// 🧾 Delete Order
// -------------------------
export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findByIdAndDelete(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json({ success: true, message: "Order deleted" });
  } catch (err) {
    console.error("deleteOrder error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
  
// Order status update
// -------------------------
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
    if (!order) return res.status(404).json({ message: "Order not found" });

    const io = req.app.get("io");
    if (io) {
      io.emit("orderUpdated", order); // Notify admin panel
      io.to(`user_${order.user.id}`).emit("orderUpdated", order); // Notify specific user
    }

    res.json({ success: true, message: "Order status updated", order });
  } catch (err) {
    console.error("Update order status error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

