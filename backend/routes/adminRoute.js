import express from "express";
import { protect } from "../Middleware/adminMiddleware.js";
import { adminLogin , 
  getAllOrders , 
  adminLogout , 
  getDashboardData , 
  deleteOrder , 
  updateOrderStatus , 
  getAllUsers , 
  toggleBlockUser , 
  deleteUser}  from "../controller/adminController.js";

const router = express.Router();

// admin login
router.post("/login",  adminLogin);

//admin logout
router.post("/logout",  adminLogout);

//admin dashboard data
router.get("/admin-dash", protect , getDashboardData);

// fetching all orders by users
router.get("/orders", protect, getAllOrders);

// 🧾 Order management
router.delete("/orders/:id", protect, deleteOrder);
router.put("/orders/:id/status", protect, updateOrderStatus);

// 🧍 User management
router.get("/users", protect, getAllUsers);
router.put("/users/:id", protect, toggleBlockUser);
router.delete("/users/:id", protect, deleteUser);

// checking for admin authentication
router.get("/check", protect, (req, res) => {
  console.log("Cookies:", req.cookies);
  res.json({ authenticated: true, admin: req.admin });
});




export default router;
