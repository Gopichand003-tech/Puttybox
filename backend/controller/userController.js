import User from "../models/User.js";

/* --------------------------------------------
   Helper: Calculate Expiry Date
-------------------------------------------- */
const calculateExpiry = (months) => {
  const now = new Date();
  const expiry = new Date(now);
  expiry.setMonth(expiry.getMonth() + months);
  return { now, expiry };
};

/* --------------------------------------------
   Helper: Parse Duration
   Accepts: 3, "3", "3m", "3-months", "3 months"
   Returns: Integer months
-------------------------------------------- */
const parseDuration = (raw) => {
  if (!raw) return null;
  if (typeof raw === "number" && raw > 0) return raw;
  if (typeof raw === "string") {
    const digits = raw.match(/\d+/);
    return digits ? parseInt(digits[0]) : null;
  }
  return null;
};

/* --------------------------------------------
   1️⃣ Generic: setPremium
-------------------------------------------- */
export const setPremium = async (req, res) => {
  try {
    const userId = req.user.id;
    const { durationMonths, duration, plan } = req.body;

    const months =
      parseDuration(durationMonths) ||
      parseDuration(duration) ||
      parseDuration(plan) ||
      1;

    const { now, expiry } = calculateExpiry(months);

    const user = await User.findByIdAndUpdate(
      userId,
      {
        isPremium: true,
        premiumSince: now,
        premiumExpiry: expiry,
        premiumPlan: `${months}m`,
      },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      success: true,
      message: `✅ Premium set for ${months} month(s)`,
      user,
    });
  } catch (err) {
    console.error("Set premium error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* --------------------------------------------
   2️⃣ Upgrade Premium
-------------------------------------------- */
export const upgradeToPremium = async (req, res) => {
  try {
    const userId = req.user.id;
    const { durationMonths, duration, plan } = req.body;

    const months =
      parseDuration(durationMonths) ||
      parseDuration(duration) ||
      parseDuration(plan) ||
      1;

    const { now, expiry } = calculateExpiry(months);
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // ✅ Calculate total boxes based on months
    const planToBoxes = { 1: 30, 3: 90, 6: 180 };
    const totalBoxes = planToBoxes[months] || months * 30;

    user.isPremium = true;
    user.premiumSince = now;
    user.premiumExpiry = expiry;
    user.premiumPlan = `${months}m`;
    user.totalBoxes = totalBoxes;
    user.deliveredBoxes = 0; // reset on upgrade

    await user.save();

    res.json({
      success: true,
      message: `⭐ Premium upgraded for ${months} month(s)`,
      user,
    });
  } catch (err) {
    console.error("Upgrade premium error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


/* --------------------------------------------
   3️⃣ Activate Premium (Main)
-------------------------------------------- */
export const activatePremium = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { duration } = req.body;
    const months = duration === "6month" ? 6 : duration === "3month" ? 3 : 1;
    const { now, expiry } = calculateExpiry(months);

    const planToBoxes = { 1: 30, 3: 90, 6: 180 };
    const totalBoxes = planToBoxes[months] || months * 30;

    user.isPremium = true;
    user.premiumSince = now;
    user.premiumExpiry = expiry;
    user.premiumPlan = `${months}m`;
    user.totalBoxes = totalBoxes;
    user.deliveredBoxes = 0;

    await user.save();

    res.json({
      message: `✅ Premium activated for ${months} month(s)`,
      totalBoxes: user.totalBoxes,
      premiumSince: user.premiumSince,
      premiumExpiry: user.premiumExpiry,
      premiumPlan: user.premiumPlan,
    });
  } catch (err) {
    console.error("❌ Premium activation error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


/* --------------------------------------------
   4️⃣ Check Premium Status (Safe Version)
-------------------------------------------- */
export const checkPremiumStatus = async (req, res) => {
  try {
    const userId = req.params.userId || req.user?.id;
    if (!userId) return res.status(400).json({ message: "Missing user ID" });

    const user = await User.findById(userId).select(
      "isPremium premiumSince premiumExpiry premiumPlan name email totalBoxes deliveredBoxes"
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    const now = new Date();

    // ⏳ Expiry check
    if (user.premiumExpiry && now > new Date(user.premiumExpiry)) {
      user.isPremium = false;
      await user.save();
      return res.json({
        isPremium: false,
        message: "⏳ Premium expired",
        totalBoxes: user.totalBoxes || 0,
        deliveredBoxes: user.deliveredBoxes || 0,
        remainingBoxes: 0,
      });
    }

    // ✅ Smart box fix — only if totalBoxes missing or corrupted
    let totalBoxes = user.totalBoxes || 0;
    const deliveredBoxes = user.deliveredBoxes || 0;

    if (!totalBoxes || totalBoxes <= 0) {
      const months = parseDuration(user.premiumPlan) || 1;
      const planToBoxes = { 1: 30, 3: 90, 6: 180 };
      totalBoxes = planToBoxes[months] || months * 30;

      user.totalBoxes = totalBoxes;
      await user.save();
    }

    const remainingBoxes = Math.max(totalBoxes - deliveredBoxes, 0);

    res.json({
      isPremium: user.isPremium,
      message: "✅ Premium active",
      premiumSince: user.premiumSince,
      premiumExpiry: user.premiumExpiry,
      premiumPlan: user.premiumPlan,
      totalBoxes,
      deliveredBoxes,
      remainingBoxes,
    });
  } catch (err) {
    console.error("Check premium status error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
