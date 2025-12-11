import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true, lowercase: true, trim: true },
    password: { type: String },
    provider: { type: String, default: "local" }, // "local" or "google"
    profilePic: { type: String },
    role: { type: String, default: "user" },

    // Password reset (optional)
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },

    // Premium details
    isPremium: { type: Boolean, default: false },
    premiumSince: { type: Date, default: null },
    premiumExpiry: { type: Date, default: null },

    // block or deleting user
    blocked: { type: Boolean, default: false },

    // Boxes tracking
    totalBoxes: { type: Number, default: 0 },
    deliveredBoxes: { type: Number, default: 0 },

    // ---- Email OTP fields (for verification) ----
    emailOtp: { type: String },                // 6-digit code (stored as string)
    emailOtpExpires: { type: Date },           // expiry timestamp
    emailOtpAttempts: { type: Number, default: 0 }, // number of verification attempts
    otpLastSentAt: { type: Number },           // epoch ms for last send (rate-limiting)
    emailVerified: { type: Boolean, default: false }, // optional flag if you want to mark verified
  },
  { timestamps: true }
);

// Virtual field to check validity
userSchema.virtual("isPremiumValid").get(function () {
  if (!this.isPremium || !this.premiumExpiry) return false;
  return new Date() <= this.premiumExpiry;
});

export default mongoose.model("User", userSchema);
