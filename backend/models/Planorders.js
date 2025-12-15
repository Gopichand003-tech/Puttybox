// backend/models/Planorders.js
import mongoose from "mongoose";

const PlanOrderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    planType: {
      type: String,
      required: true,
    },
    selected: {
      type: Object,
      required: true,
    },
    proteinTarget: Number,

    // ✅ UPDATED ENUM
    status: {
      type: String,
      enum: ["scheduled", "in-progress", "delivered", "cancelled"],
      default: "scheduled",
    },

    estimatedDelivery: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  },
  { timestamps: true }
);

export default mongoose.model("PlanOrder", PlanOrderSchema);
