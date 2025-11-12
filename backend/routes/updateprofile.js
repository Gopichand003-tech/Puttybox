import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import User from "../models/User.js";
import protect from "../Middleware/authMiddleware.js";
import dotenv from "dotenv";

dotenv.config(); // ✅ Ensure env vars are loaded before Cloudinary config

const router = express.Router();

// ✅ Configure multer (store in memory)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ Configure Cloudinary securely using env vars
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error("❌ Missing Cloudinary environment variables. Please check your .env file.");
} else {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// ✅ Safe user response helper
const safeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  profilePic: user.profilePic || "",
  provider: user.provider || "local",
  role: user.role || "user",
});

// ✅ PUT: Update profile
router.put("/update-profile", protect, upload.single("profilePic"), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { name, email } = req.body;
    if (name) user.name = name;
    if (email) user.email = email;

    // ✅ Upload new profile picture to Cloudinary if provided
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "Puttybox" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(req.file.buffer);
      });
      user.profilePic = result.secure_url;
    }

    await user.save();
    res.json(safeUser(user));
  } catch (err) {
    console.error("❌ Profile update error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
