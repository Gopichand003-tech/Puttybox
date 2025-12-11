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

const otpStore = new Map();

// -------------------- HELPER: SET COOKIE --------------------
const setTokenCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // true only on Render
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
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

    // ✅ Clear old cookie first — works in both local and production
res.clearCookie("token", {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // only secure on production
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
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

    // ✅ Clear old cookie first — works in both local and production
res.clearCookie("token", {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // only secure on production
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
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

//Email
//Email
router.post("/send-email-otp", async (req, res) => {
  try {
    const rawEmail = req.body.email;
    const email = (rawEmail || "").toString().trim().toLowerCase();

    console.log("send-email-otp called for:", JSON.stringify(email));
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ message: "Valid email required" });
    }

    const now = Date.now();

    // rate limit via otpStore (fallback) OR via user doc if exists
    const user = await User.findOne({ email });

    // if user exists, use user doc fields for persistence (current behavior)
    if (user) {
      if (user.otpLastSentAt && now - user.otpLastSentAt < 60 * 1000) {
        return res.status(429).json({ message: "OTP recently sent — try again in a moment" });
      }

      const otp = String(Math.floor(100000 + Math.random() * 900000));
      user.emailOtp = otp;
      user.emailOtpExpires = new Date(now + 2 * 60 * 1000);
      user.emailOtpAttempts = 0;
      user.otpLastSentAt = now;
      await user.save();

      await transporter.sendMail({
        from: `"Support" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Your verification code",
        html: `<p>Your verification code is: <strong>${otp}</strong>. It expires in 2 minutes.</p>`,
      });

      console.log("OTP stored on user doc for", email, otp);
      return res.json({ ok: true, message: "OTP sent to email", where: "user-doc" });
    }

    // if user NOT found — store OTP in-memory (dev) or in DB (prod)
    const existing = otpStore.get(email);
    if (existing && now - existing.lastSentAt < 60 * 1000) {
      return res.status(429).json({ message: "OTP recently sent — try again in a moment" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    otpStore.set(email, {
      otp,
      expires: now + 2 * 60 * 1000,
      attempts: 0,
      lastSentAt: now,
    });

    await transporter.sendMail({
      from: `"Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your verification code",
      html: `<p>Your verification code is: <strong>${otp}</strong>. It expires in 2 minutes.</p>`,
    });

    console.log("OTP stored in otpStore for", email, otp);
    return res.json({ ok: true, message: "OTP sent to email", where: "otpStore" });
  } catch (err) {
    console.error("🔥 send-email-otp error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});


// -------------------- VERIFY EMAIL OTP --------------------
router.post("/verify-email-otp", async (req, res) => {
  try {
    const rawEmail = req.body.email;
    const email = (rawEmail || "").toString().trim().toLowerCase();
    const otp = String(req.body.otp || "").trim();

    console.log("verify-email-otp called for:", JSON.stringify(email), "otp:", otp ? "***" : "(empty)");

    if (!email || !otp) return res.status(400).json({ message: "Missing fields" });

    const user = await User.findOne({ email });

    // If user exists: verify against fields stored on user doc
    if (user && (user.emailOtp || user.emailOtpExpires)) {
      console.log("Found user doc. user.emailOtpExists:", !!user.emailOtp, "expires:", user.emailOtpExpires);

      // If no OTP was requested
      if (!user.emailOtp || !user.emailOtpExpires) {
        return res.status(400).json({ message: "No OTP requested for this email", where: "user-doc" });
      }

      // Expiry check
      if (new Date() > new Date(user.emailOtpExpires)) {
        // cleanup
        user.emailOtp = undefined;
        user.emailOtpExpires = undefined;
        user.emailOtpAttempts = undefined;
        await user.save();
        return res.status(400).json({ message: "OTP expired", where: "user-doc" });
      }

      // Brute-force protection
      user.emailOtpAttempts = (user.emailOtpAttempts || 0) + 1;
      if (user.emailOtpAttempts > 5) {
        // clean up and force retry after expiry
        user.emailOtp = undefined;
        user.emailOtpExpires = undefined;
        user.emailOtpAttempts = undefined;
        await user.save();
        return res.status(429).json({ message: "Too many attempts - request a new OTP", where: "user-doc" });
      }

      // Validate OTP
      if (String(otp).trim() !== String(user.emailOtp).trim()) {
        await user.save(); // persist incremented attempts
        return res.status(400).json({ message: "Invalid OTP", where: "user-doc" });
      }

      // Success — clear OTP fields and optionally mark email verified
      user.emailOtp = undefined;
      user.emailOtpExpires = undefined;
      user.emailOtpAttempts = undefined;
      user.otpLastSentAt = undefined;
      // OPTIONAL: user.emailVerified = true;
      await user.save();

      return res.json({ ok: true, message: "Verified", where: "user-doc" });
    } else {
      // fallback to in-memory otpStore
      console.log("No user or no OTP on user doc; checking otpStore for", email);
      const rec = otpStore.get(email);
      if (!rec) return res.status(400).json({ message: "No OTP requested for this email", where: "otpStore" });

      if (Date.now() > rec.expires) {
        otpStore.delete(email);
        return res.status(400).json({ message: "OTP expired", where: "otpStore" });
      }

      rec.attempts = (rec.attempts || 0) + 1;
      if (rec.attempts > 5) {
        otpStore.delete(email);
        return res.status(429).json({ message: "Too many attempts - request a new OTP", where: "otpStore" });
      }

      if (String(otp).trim() !== String(rec.otp).trim()) {
        // persist attempt count
        otpStore.set(email, rec);
        return res.status(400).json({ message: "Invalid OTP", where: "otpStore" });
      }

      // success
      otpStore.delete(email);
      return res.json({ ok: true, message: "Verified", where: "otpStore" });
    }
  } catch (err) {
    console.error("🔥 verify-email-otp error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
