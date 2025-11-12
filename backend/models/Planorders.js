// backend/models/Planorders.js
import mongoose from "mongoose";

const PlanOrderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    planType: { type: String, required: true },
    selected: { type: Object, required: true },
    proteinTarget: { type: Number },
    status: {
      type: String,
      enum: ["scheduled", "in-progress", "delivered"],
      default: "scheduled",
    },
    estimatedDelivery: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // next day
    },
  },
  { timestamps: true }
);

const PlanOrder =
  mongoose.models.PlanOrder || mongoose.model("PlanOrder", PlanOrderSchema);

export default PlanOrder;
