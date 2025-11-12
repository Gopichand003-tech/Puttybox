import express from "express";
import {
  placeQuickOrder,
  getUserOrders,
  
  cancelOrder,
} from "../controller/quickorder.js";
import protect from "../Middleware/authMiddleware.js";

const router = express.Router();

// ✅ Place new order
router.post("/quick-order", protect, placeQuickOrder);

// ✅ Get only logged-in user's orders
router.get("/Get-order", protect, getUserOrders);


// ✅ Cancel order (within 3 minutes)
router.put("/:id/cancel-order", protect, cancelOrder);



export default router;
