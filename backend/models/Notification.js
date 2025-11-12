// models/Notification.js
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
    time: { type: String, default: () => new Date().toLocaleString() },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true } // ✅ Adds createdAt and updatedAt
);


export default mongoose.model("Notification", notificationSchema);
