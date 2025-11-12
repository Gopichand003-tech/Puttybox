import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { OAuth2Client } from "google-auth-library";
import  protect  from "../Middleware/authMiddleware.js"; // ✅ must use named import
import nodemailer from "nodemailer";
import { setPremium, upgradeToPremium , activatePremium , checkPremiumStatus} from "../controller/userController.js"; // ✅ combine import
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// -------------------- EMAIL SETUP --------------------
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

console.log("Email user:", process.env.EMAIL_USER);
console.log("Email pass:", process.env.EMAIL_PASS ? "Loaded ✅" : "Missing ❌");

// -------------------- HELPER: SET COOKIE --------------------
const setTokenCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
//     sameSite: "lax",
// secure: false, // only for localhost

    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

// -------------------- PREMIUM ROUTES --------------------
router.post("/premium", protect, setPremium);
router.post("/upgrade-premium", protect, upgradeToPremium);
router.post("/activatePremium", protect , activatePremium);
router.get(["/checkPremiumStatus", "/checkPremiumStatus/:userId"], protect, checkPremiumStatus);

// -------------------- REGISTER --------------------
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    setTokenCookie(res, token);

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        profilePic: newUser.profilePic || "",
        provider: newUser.provider || "local",
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// -------------------- LOGIN --------------------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ message: "Email and password are required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

     // ✅ Clear old cookie first
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
//       sameSite: "lax",
// secure: false, // only for localhost

    });


    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    
    setTokenCookie(res, token);

    res.status(200).json({
      message: "Login successful",
     user: {
  id: user._id,
  name: user.name,
  email: user.email,
  profilePic: user.profilePic || "",
  provider: user.provider || "local",
  isPremium: user.isPremium,
  premiumSince: user.premiumSince,
  premiumExpiry: user.premiumExpiry,
},

    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// -------------------- GOOGLE LOGIN --------------------
router.post("/google-login", async (req, res) => {
  try {
    const { token } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { name, email, picture } = payload;

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name,
        email,
        profilePic: picture,
        provider: "google",
      });
    }

     // ✅ Clear old cookie first
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
//       sameSite: "lax",
// secure: false, // only for localhost

    });


    const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    setTokenCookie(res, jwtToken);

    res.json({
      user: {
  id: user._id,
  name: user.name,
  email: user.email,
  profilePic: user.profilePic || "",
  provider: user.provider || "google",
  isPremium: user.isPremium,
  premiumSince: user.premiumSince,
  premiumExpiry: user.premiumExpiry,
},

    });
  } catch (err) {
    console.error("Google login error:", err);
    res.status(400).json({ message: "Invalid Google login" });
  }
});

// -------------------- LOGOUT --------------------
router.post("/logout", (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.json({ message: "Logged out successfully" });
});

// backend/routes/authRoute.js (or similar)
router.get("/me", async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Not authenticated" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ user }); // ✅ Important: send full user object here
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// -------------------- CHANGE PASSWORD --------------------
router.put("/change-password", protect, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.password)
      return res
        .status(400)
        .json({ message: "No password set for this account" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Old password is incorrect" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// -------------------- FORGOT PASSWORD --------------------
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "10m",
    });
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const mailOptions = {
      from: `"Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset Request",
      html: `
        <p>Hello ${user.name},</p>
        <p>Click below to reset your password (valid 10 min):</p>
        <a href="${resetLink}" target="_blank">${resetLink}</a>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: "Password reset email sent" });
  } catch (err) {
    console.error("🔥 Forgot Password Error:", err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
      stack: err.stack,
    });
  }
});


// -------------------- RESET PASSWORD --------------------
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    res.status(400).json({ message: "Invalid or expired token" });
  }
});

export default router;
