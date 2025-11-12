// middlewares/authMiddleware.js
import jwt from "jsonwebtoken";
import Admin from "../models/admin.js";

export const protect = async (req, res, next) => {
  try {
    const token = req.cookies?.adminToken; // 👈 from cookie

    if (!token) return res.status(401).json({ message: "Not authorized, no token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = await Admin.findById(decoded.id).select("-password");

    if (!req.admin) return res.status(401).json({ message: "Admin not found" });

    next();
  } catch (err) {
    console.error("Auth error:", err);
    res.status(401).json({ message: "Not authorized, invalid token" });
  }
};
