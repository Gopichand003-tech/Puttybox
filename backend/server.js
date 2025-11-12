import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
import { Server as IOServer } from "socket.io";
import { autoUpdateOrderStatuses } from "./utils/autoupdate.js";

// ---------- Import Routes ----------
import authRoutes from "./routes/authRoute.js";
import updateProfileRoutes from "./routes/updateprofile.js";
import quickOrderRoutes from "./routes/orderRoute.js";
import adminRoutes from "./routes/adminRoute.js";
import NotificationRoutes from "./routes/notifyRoute.js";
import planRoutes from "./routes/PlansRoute.js";
import mealRoutes from "./routes/MealRoute.js";
// ---------- App Setup ----------
const app = express();
const server = http.createServer(app);

// ---------- Middleware ----------
app.use(cookieParser());
app.use(express.json());

app.use(
  cors({
    origin: ["http://localhost:5173","https://putty-box.onrender.com" ], // must match frontend
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ---------- MongoDB Connection ----------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// ---------- Socket.IO ----------
const io = new IOServer(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT"],
    credentials: true,
  },
});

// Make io globally available to controllers
app.set("io", io);

io.on("connection", (socket) => {
  console.log(`⚡ User connected: ${socket.id}`);

  socket.on("joinUser", (userId) => {
    if (userId) {
      socket.join(`user_${userId}`);
      console.log(`👤 User ${userId} joined private room`);
    }
  });

  socket.on("leaveUser", (userId) => {
    if (userId) {
      socket.leave(`user_${userId}`);
      console.log(`👋 User ${userId} left their private room`);
    }
  });

  socket.on("disconnect", () => {
    console.log(`❌ Disconnected: ${socket.id}`);
  });
});

// ---------- Routes ----------
app.use("/api/auth", authRoutes);
app.use("/api/update", updateProfileRoutes);
app.use("/api/orders", quickOrderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications/", NotificationRoutes);
app.use("/api/planorder/", planRoutes);
app.use("/api/mealorder/", mealRoutes);
// ---------- Lifecycle Auto-Update (after io exists) ----------
setInterval(async () => {
  try {
    await autoUpdateOrderStatuses(io);
  } catch (err) {
    console.error("Lifecycle updater error:", err.message);
  }
}, 5000); // every 5 seconds

// ---------- Debug Middleware ----------
app.use((req, res, next) => {
  console.log("🧩 Incoming:", req.method, req.url);
  next();
});

// ---------- Server Start ----------
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
