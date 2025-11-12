import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    // 👤 Linked User Info
    user: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      name: { type: String, required: true },
      email: { type: String },
    },

    // 🍱 Meal Info
    mealType: {
      type: String,
      enum: ["breakfast", "lunch", "dinner"],
      required: true,
    },

    // 🥗 Ordered Items
    items: [
      {
        name: { type: String, required: true },
        price: { type: Number, required: true },
        calories: { type: Number },
        quantity: { type: Number, default: 1 },
      },
    ],

    // 📍 Delivery Details
    address: { type: String, required: true },
    phone: { type: String, required: true }, // ✅ moved here (root level)
    
    // 💰 Payment Info
    paymentMethod: {
      type: String,
      enum: ["cod", "online"],
      default: "cod",
    },
    total: { type: Number, required: true },

    // 🚚 Order Lifecycle
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "cooking",
        "out for delivery",
        "cancelled",
        "delivered",
      ],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
