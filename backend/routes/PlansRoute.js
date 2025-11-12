import express from "express";
import { mealOptions } from "../Data/Mealoptions.js";

const router = express.Router();

router.get("/:planType", (req, res) => {
  const planType = req.params.planType?.toLowerCase();
  const plan = mealOptions[planType];
  if (!plan) {
    return res.status(404).json({ error: "Plan not found" });
  }
  res.json(plan);
});

export default router;
