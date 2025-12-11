// Customize.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../components/Header";
import Cookies from "js-cookie";
import {
  CheckCircle,
  XCircle,
  Zap,
  CreditCard,
  PieChart,
  ArrowLeft,
  ArrowRight,
  Home,
  Pin,
  DoorClosedLocked,
  Truck,
  Receipt,
  Wallet,
} from "lucide-react";
import { FaMoneyBill } from "react-icons/fa";
import { useAuth } from "../context/Authcontext";
import { toast, Toaster } from "sonner";
import axios from "axios";

export default function Customize() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("meal");
  const [step, setStep] = useState(1);
  const [isPremium, setIsPremium] = useState(false);

  const vijayawadaAreas = [
    "Benz Circle",
    "Governorpet",
    "Auto Nagar",
    "Gunadala",
    "Labbipet",
    "Patamata",
    "Moghalrajpuram",
    "K.P. Nagar",
    "Singhnagar",
    "Bhavanipuram",
    "Ajit Singh Nagar",
    "Christurajupuram",
    "Krishna Lanka",
    "Kanuru",
    "Ramavarappadu",
    "Enikepadu",
    "Poranki",
    "Eluru Road",
    "Nidamanuru",
    "Vidyadharapuram",
    "Yanamalakuduru",
    "Prasadampadu",
    "Kesarapalli",
    "Gollapudi",
    "Tadigadapa",
    "Currency Nagar",
    "Satyaranayana Puram",
    "Vijayawada Club Road",
    "Chuttugunta",
  ];

  const memberships = [
    { id: 1, label: "1 Month", price: 179, badge: "Popular", video: "/videos/Premium button animation.mp4" },
    { id: 3, label: "3 Months", price: 169, badge: "Save 5%", video: "/videos/Level up silver.mp4" },
    { id: 6, label: "6 Months", price: 149, badge: "Save 15%", video: "/videos/Premium Gold.mp4" },
  ];

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const { activatePremium } = useAuth();
  const query = new URLSearchParams(useLocation().search);
  // make sure plan is numeric so downstream checks (=== 1 etc.) work
  const initialPlan = parseInt(query.get("plan"), 10) || 1;

  const [selectedMembership, setSelectedMembership] = useState(initialPlan);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [mealType, setMealType] = useState(new Set());
  const [preferencesSet, setPreferencesSet] = useState(new Set());
  const [preferencesExtra, setPreferencesExtra] = useState("");
  const [address, setAddress] = useState("");
  const [doorNo, setDoorNo] = useState("");
  const [landmark, setLandmark] = useState("");
  // phone contact state
const [contact, setContact] = useState("");

  // ✅ Missing state added here
  const [loading, setLoading] = useState(false);

  const preferencesOptions = ["Less Spicy", "More Spicy", "No Sugar", "Less Oil"];

  const togglePreference = (opt) => {
    const updated = new Set(preferencesSet);
    updated.has(opt) ? updated.delete(opt) : updated.add(opt);
    setPreferencesSet(updated);
  };

  const toggleMealType = (meal) => {
    const newSet = new Set(mealType);
    newSet.has(meal) ? newSet.delete(meal) : newSet.add(meal);
    setMealType(newSet);
  };



  const nextStep = () => setStep((s) => Math.min(s + 1, 5));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

 // ✅ Payment handler
 const handlePayment = async () => {
  if (!address || !vijayawadaAreas.includes(address)) {
    toast.warning("Please enter a valid Vijayawada address before proceeding.", {
      duration: 4000,
      position: "top-center",
      style: {
        background: "#fff8e1",
        color: "#b45309",
        fontWeight: "500",
        border: "1px solid #fde68a",
      },
    });
    return;
  }

  if (!paymentMethod) {
    toast.error("⚠️ Please select a payment method before proceeding.", {
      duration: 4000,
      position: "top-center",
    });
    return;
  }

  setLoading(true);
  setIsProcessing(true);

  try {
    await new Promise((resolve) => setTimeout(resolve, 3000));

    setLoading(false);
    setIsProcessing(false);
    setPaymentDone(true);

    // ✅ Convert plan string to actual months
    const planMonths =
  selectedMembership === 1 ? 1 :
  selectedMembership === 3 ? 3 :
  selectedMembership === 6 ? 6 : 1;

    // ✅ Pass months to backend
    await activatePremium(planMonths);

    toast.success("🎉 Payment successful! Your premium plan is activated.", {
      duration: 4000,
      position: "top-center",
    });

    setTimeout(() => navigate("/dashboard?status=success"), 2500);
  } catch (error) {
    console.error("Payment failed:", error);
    setIsProcessing(false);
    setLoading(false);
    toast.error("Payment failed. Please try again.");
  }
};



  // Nutrition calculator states
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [activity, setActivity] = useState("");
  const [calcResult, setCalcResult] = useState(null);

  const calculateBMR = (w, h, a, g) =>
    g === "male"
      ? 10 * w + 6.25 * h - 5 * a + 5
      : 10 * w + 6.25 * h - 5 * a - 161;

  const activityFactor = (lvl) =>
    (
      {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
        very: 1.9,
      }[lvl] || 1.55
    );

  const calculateNutrition = () => {
    if (!weight || !height || !age || !gender || !activity) {
      alert("Please fill all fields!");
      return;
    }
    const bmr = calculateBMR(weight, height, age, gender);
    const tdee = Math.round(bmr * activityFactor(activity));
    const proteinG = Math.round(1.6 * weight);
    const fatCalories = Math.round(0.25 * tdee);
    const fatG = Math.round(fatCalories / 9);
    const proteinCalories = proteinG * 4;
    const carbsCalories = tdee - proteinCalories - fatCalories;
    const carbsG = Math.max(0, Math.round(carbsCalories / 4));
    setCalcResult({ bmr: Math.round(bmr), tdee, proteinG, fatG, carbsG });
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-green-50 via-white to-gray-200 text-gray-900 font-sans overflow-x-hidden relative">
      
      <Header isPremium={isPremium} />

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative flex flex-col-reverse md:flex-row items-center justify-between w-full min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-100 px-4 sm:px-6 md:px-20"
      >
        <motion.div
          initial={{ x: -60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="w-full md:w-1/2 flex flex-col justify-center items-start space-y-6"
        >
          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-extrabold text-emerald-900 leading-tight ml-2 sm:ml-4 md:ml-10">
            Personalize <br />
            <span className="text-green-500 drop-shadow-md">Your Experience</span>
          </h1>
          <p className="text-gray-800 text-base sm:text-lg md:text-xl leading-relaxed max-w-lg ml-2 sm:ml-4 md:ml-10">
            Customize your meal plan or calculate your nutritional needs.
          </p>

          {/* Tab Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="inline-flex bg-emerald-50 rounded-2xl border border-emerald-100 overflow-hidden shadow-md ml-2 sm:ml-4 md:ml-10"
          >
            <button
              onClick={() => setTab("meal")}
              className={`px-4 sm:px-8 py-2 sm:py-3 font-medium transition-all duration-300 ${
                tab === "meal"
                  ? "bg-white text-emerald-900 shadow"
                  : "text-emerald-600 hover:bg-white hover:text-emerald-900"
              }`}
            >
              Meal Plan
            </button>
            <button
              onClick={() => setTab("calc")}
              className={`px-4 sm:px-8 py-2 sm:py-3 font-medium transition-all duration-300 ${
                tab === "calc"
                  ? "bg-white text-emerald-900 shadow"
                  : "text-emerald-600 hover:bg-white hover:text-emerald-900"
              }`}
            >
              Nutrition Calculator
            </button>
          </motion.div>
        </motion.div>

        {/* Hero Video */}
        <motion.div
          initial={{ x: 60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="w-full md:w-1/2 flex justify-center items-center mt-8 md:mt-0"
        >
          <div className="w-full max-w-xs sm:max-w-sm md:max-w-md rounded-full overflow-hidden shadow-2xl border-4 border-gray-300">
            <video
              src="/food.mp4"
              autoPlay
              muted
              loop
              className="w-full h-full object-cover"
            />
          </div>
        </motion.div>
      </motion.section>

      {/* Main Section */}
      <div className="w-full bg-white/90 backdrop-blur-sm py-12 px-4 sm:px-6 md:px-20 ">
        {tab === "meal" ? (
          <>
            {/* Step 1 */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative rounded-2xl overflow-hidden shadow-2xl"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage:
                      "url('https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=1600&q=80')",
                  }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/40 to-emerald-40/80 backdrop-blur-[1px]"></div>

                <div className="relative z-10 px-4 sm:px-8 md:px-12 py-12 sm:py-16 space-y-8 text-center">
                  <motion.h2
                    initial={{ opacity: 0, y: -15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-emerald-900 tracking-tight drop-shadow-sm"
                  >
                    Choose Your {" "}
                    <span className="text-orange-900">Membership</span>
                  </motion.h2>

                  <p className="max-w-2xl mx-auto text-emerald-900 text-sm sm:text-lg md:text-2xl">
                    Pick the plan that fits your meal goals. You can upgrade anytime!
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mt-8 sm:mt-10 place-items-center">
                    {memberships.map((m) => (
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        key={m.id}
                        onClick={() => setSelectedMembership(m.id)}
                        className={`relative w-56 sm:w-64 md:w-72 h-56 sm:h-64 md:h-72 rounded-full overflow-hidden border-4 transition-all duration-500 group shadow-xl ${
                          selectedMembership === m.id
                            ? "border-orange-400 ring-4 ring-orange-300 scale-[1.06]"
                            : "border-transparent hover:border-orange-300"
                        }`}
                      >
                        <video
                          src={m.video}
                          autoPlay
                          loop
                          muted
                          className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700"
                        ></video>

                        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/10 to-black/20"></div>

                        <div className="relative z-10 flex flex-col justify-between h-full text-center text-white py-6">
                          <h3 className="text-2xl sm:text-3xl font-extrabold tracking-wide drop-shadow-[0_0_12px_rgba(255,255,255,0.9)] group-hover:drop-shadow-[0_0_20px_rgba(255,165,0,1)] transition-all duration-500">
                            {m.label}
                          </h3>
                          <div className="flex-1"></div>
                          <div className="flex flex-col items-center space-y-2 px-4">
                            <p
                             className="text-base sm:text-lg font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-400 
                            px-2 py-2 rounded-xl border border-orange-300 shadow-[0_0_25px_rgba(255,165,0,0.9)] 
                            group-hover:shadow-[0_0_45px_rgba(255,200,100,1)] group-hover:scale-105 
                            transition-all duration-500 tracking-wide" >₹{m.price}/meal
                             </p>

                            {m.badge && (
                              <span className="px-3 py-1 text-xs sm:text-sm bg-gradient-to-r from-orange-500 to-amber-400 text-white rounded-full uppercase font-extrabold tracking-wider shadow-[0_0_15px_rgba(255,165,0,0.8)] group-hover:shadow-[0_0_25px_rgba(255,200,100,1)] transition-all duration-500">
                                {m.badge}
                              </span>
                            )}
                          </div>
                        </div>

                        {selectedMembership === m.id && (
                          <motion.div
                            layoutId="glowRing"
                            className="absolute inset-0 rounded-full ring-4 ring-orange-300 ring-offset-2"
                            transition={{
                              type: "spring",
                              stiffness: 180,
                              damping: 20,
                            }}
                          />
                        )}
                      </motion.button>
                    ))}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={nextStep}
                    className="mt-6 sm:mt-10 inline-block px-6 sm:px-10 py-2 sm:py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold text-base sm:text-lg rounded-full shadow-lg hover:from-emerald-700 hover:to-emerald-800 transition"
                  >
                    Continue →
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Step 2 */}

{step === 2 && (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    className="relative rounded-2xl overflow-hidden shadow-2xl"
  >
    {/* Background Video */}
    <video
      src="/videos/selecting.mp4"
      autoPlay
      loop
      muted
      playsInline
      className="absolute inset-0 w-full h-full object-cover opacity-90"
    />

    {/* Overlay for brightness & readability */}
    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-emerald-40/80 backdrop-blur-[1px] shadow-2xl border-4 border-gray-200"></div>

    {/* Content */}
    <div className="relative z-10 px-4 sm:px-8 md:px-12 py-12 space-y-6 text-center">
      <motion.h2
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-white tracking-tight drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]"
      >
        Choose Your <span className="text-orange-600">Meal</span>
      </motion.h2>

      <p className="max-w-2xl mx-auto text-white/90 text-sm sm:text-lg md:text-2xl font-medium drop-shadow-[0_0_10px_rgba(0,0,0,0.3)]">
        Feeling hungry? What are you waiting for — select your favorite meal!
      </p>
    </div>

    {/* Meal Options */}
    <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-6 place-items-center mt-6 px-4 sm:px-6">
      {["Breakfast", "Lunch", "Dinner"].map((meal) => (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          key={meal}
          onClick={() => toggleMealType(meal)}
          className={`relative w-44 sm:w-56 h-44 sm:h-56 rounded-full overflow-hidden transition-all duration-500 group shadow-lg ${
            mealType.has(meal)
              ? "ring-5 ring-orange-400 scale-[1.03]"
              : "hover:ring-2 hover:ring-orange-300"
          }`}
        >
          <video
            src={`/videos/${meal.toLowerCase()}.mp4`}
            autoPlay
            loop
            muted
            className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition"
          />
          <div className="absolute inset-0 bg-black/30 rounded-full"></div>
          <h3 className="relative z-10 text-white text-xl sm:text-2xl font-bold drop-shadow-[0_0_12px_rgba(255,255,255,1)]">
            {meal}
          </h3>
        </motion.button>
      ))}
    </div>

    {/* Navigation Buttons */}
    <div className="relative z-10 flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-10 mt-8 sm:mt-16 mb-8">
      <button
        onClick={prevStep}
        className="flex items-center gap-2 px-6 py-2 sm:px-8 sm:py-3 rounded-full border-2 border-emerald-600 text-emerald-100 font-semibold hover:bg-emerald-600 hover:text-white transition-all shadow-md hover:shadow-lg backdrop-blur-sm bg-emerald-800/20"
      >
        <ArrowLeft className="w-5 h-5" /> Back
      </button>

      <button
        onClick={nextStep}
        className="flex items-center gap-2 px-8 py-2 sm:px-10 sm:py-3 bg-gradient-to-r from-orange-500 to-amber-400 text-white font-semibold rounded-full shadow-lg hover:scale-105 transition-all"
      >
       Continue  <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  </motion.div>
)}


{/* Step 3 */}
{step === 3 && (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    className="relative rounded-3xl overflow-hidden shadow-2xl"
  >
    {/* Background Video */}
    <video
      src="/videos/preferences.mp4"
      autoPlay
      loop
      muted
      playsInline
      className="absolute inset-0 w-full h-full object-cover opacity-80"
    />

    {/* Overlay */}
    <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-emerald-900/30 to-white/20 backdrop-blur-m"></div>

    {/* Content */}
    <div className="relative z-10 px-4 sm:px-8 md:px-14 py-12 space-y-8">
      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-white text-center drop-shadow-[0_0_15px_rgba(255,255,255,0.7)]"
      >
        Your Taste <span className="text-orange-400">Preferences</span>
      </motion.h2>

      {/* Highlight Selected Meals from Step 2 */}
      {[...mealType].length > 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center flex-wrap gap-4 sm:gap-8"
        >
          {[...mealType].map((meal) => (
            <motion.div
              key={meal}
              whileHover={{ scale: 1.03 }}
              className="relative w-36 sm:w-44 h-36 sm:h-44 rounded-2xl overflow-hidden shadow-6xl border-3 border-green-800 animate-pulse bg-white/10 backdrop-blur-md"
            >
              <video
                src={`/videos/${meal.toLowerCase()}.mp4`}
                autoPlay
                loop
                muted
                className="absolute inset-0 w-full h-full object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-black/40"></div>
              <div className="absolute bottom-0 w-full text-center py-2 bg-gradient-to-t from-black/70 to-transparent">
                <h3 className="text-sm sm:text-lg font-bold text-orange-300 drop-shadow-[0_0_10px_rgba(255,165,0,0.9)] uppercase tracking-wide">
                  {meal}
                </h3>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <p className="text-center text-orange-100 text-sm">(No meal selected — go back and choose one!)</p>
      )}

      {/* Preference Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 mt-6">
        {preferencesOptions.map((opt) => (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            key={opt}
            onClick={() => togglePreference(opt)}
            className={`px-4 py-3 rounded-xl border-2 font-medium text-base sm:text-lg shadow transition-all ${
              preferencesSet.has(opt)
                ? "border-orange-400 bg-orange-100 text-orange-900 shadow-md"
                : "border-gray-200 hover:border-orange-300 hover:bg-orange-50 text-gray-700"
            }`}
          >
            {opt}
          </motion.button>
        ))}
      </div>

      {/* Textarea */}
      <textarea
        placeholder="Any extra preferences or restrictions?"
        value={preferencesExtra}
        onChange={(e) => setPreferencesExtra(e.target.value)}
        className="w-full rounded-2xl border-2 border-orange-200 px-4 py-3 h-24 sm:h-28 resize-none text-gray-800 shadow-inner focus:ring-2 focus:ring-orange-400 bg-white/70 backdrop-blur-sm"
      />

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-10 mt-8 sm:mt-16">
        <button
          onClick={prevStep}
          className="flex items-center gap-2 px-6 py-2 rounded-full border-2 border-orange-400 text-orange-100 font-semibold hover:bg-orange-500 hover:text-white transition-all backdrop-blur-sm bg-orange-800/20 shadow-md"
        >
          <ArrowLeft className="w-5 h-5" /> Back
        </button>

        <button
          onClick={nextStep}
          className="flex items-center gap-2 px-8 py-2 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white font-semibold rounded-full shadow-lg hover:scale-105 transition-all"
        >
          Next <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  </motion.div>
)}
{/* Step 4 */}
{step === 4 && (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    className="relative rounded-3xl overflow-hidden shadow-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-emerald-100 p-6 sm:p-10"
  >
    {/* Header */}
    <h2 className="flex items-center justify-center gap-2 sm:gap-3 text-2xl sm:text-4xl font-extrabold text-emerald-900 text-center mb-6 sm:mb-10 drop-shadow-[0_0_10px_rgba(0,0,0,0.1)]">
      <Truck className="w-8 h-8 sm:w-14 sm:h-14 text-orange-400 drop-shadow-sm" />
      Delivery Details
    </h2>

    {/* Address Section */}
    <div className="space-y-4 sm:space-y-6">
      {/* Door Number */}
      <div className="relative">
        <input
          type="text"
          placeholder="Door No. / Flat No."
          value={doorNo}
          onChange={(e) => setDoorNo(e.target.value)}
          className="w-full rounded-2xl border-2 border-emerald-200 px-4 py-3 shadow-inner focus:ring-2 focus:ring-emerald-300 bg-white/70 backdrop-blur-sm text-gray-800 text-sm sm:text-base"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-emerald-700 font-semibold text-xs sm:text-sm">
          <DoorClosedLocked className="w-4 h-4" /> Door No.
        </span>
      </div>

      {/* Landmark */}
      <div className="relative">
        <input
          type="text"
          placeholder="Landmark (e.g., Near Benz Circle, Opposite D-Mart)"
          value={landmark}
          onChange={(e) => setLandmark(e.target.value)}
          className="w-full rounded-2xl border-2 border-emerald-200 px-4 py-3 shadow-inner focus:ring-2 focus:ring-emerald-300 bg-white/70 backdrop-blur-sm text-gray-800 text-sm sm:text-base"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-emerald-700 font-semibold text-xs sm:text-sm">
          <Pin className="w-4 h-4" /> Landmark
        </span>
      </div>

      {/* Mobile Number (optional but recommended) */}
      <div className="relative">
        <input
          type="tel"
          placeholder="Mobile number (10 digits) — optional"
          value={contact}
          onChange={(e) => {
            const cleaned = e.target.value.replace(/\D/g, "").slice(0, 10);
            setContact(cleaned);
          }}
          className="w-full rounded-2xl border-2 border-emerald-200 px-4 py-3 shadow-inner focus:ring-2 focus:ring-emerald-300 bg-white/70 backdrop-blur-sm text-gray-800 text-sm sm:text-base"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-emerald-700 font-semibold text-xs sm:text-sm">
          <Receipt className="w-4 h-4" /> Mobile
        </span>
      </div>

      {/* Vijayawada Areas selection */}
      <div className="relative">
        <select
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full appearance-none rounded-2xl border-2 border-emerald-200 px-4 py-3 pr-20 shadow-inner focus:ring-2 focus:ring-emerald-300 bg-white/70 backdrop-blur-sm text-gray-800 text-sm sm:text-base"
        >
          <option value="">Select Delivery Area</option>
          {vijayawadaAreas.map((area) => (
            <option key={area} value={area}>
              {area}
            </option>
          ))}
        </select>

        {/* "Vijayawada only" text inside the box */}
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-emerald-700 font-semibold text-xs sm:text-sm flex items-center gap-1.5">
          <Home className="w-4 h-4" />
          Vijayawada only
        </span>
      </div>
    </div>

    {/* Navigation Buttons */}
    <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-10 mt-6 sm:mt-12">
      <button
        onClick={prevStep}
        className="flex items-center gap-2 px-6 py-2 rounded-full border-2 border-emerald-600 text-emerald-700 font-semibold hover:bg-emerald-600 hover:text-white transition-all"
      >
        ← Back
      </button>

      {/* Continue Button always visible */}
      <button
        onClick={() => {
          // Validate Area Selection
          if (!address || !vijayawadaAreas.includes(address)) {
            toast.error("❌ Delivery is available only in Vijayawada areas.", {
              duration: 4000,
              position: "top-center",
              style: {
                background: "#ffe4e6",
                color: "#b91c1c",
                fontWeight: "600",
                border: "1px solid #fecaca",
              },
            });
            return;
          }

          // Validate Contact Number only if provided
          if (contact && contact.length !== 10) {
            toast.warning("⚠️ If you entered a mobile number, it must be 10 digits.", {
              duration: 4000,
              position: "top-center",
              style: {
                background: "#fff8e1",
                color: "#b45309",
                fontWeight: "600",
                border: "1px solid #fde68a",
              },
            });
            return;
          }

          nextStep();
        }}
        className="px-8 py-2 bg-gradient-to-r from-orange-500 to-amber-400 text-white rounded-full font-semibold shadow-lg hover:scale-105 transition-all mt-2"
      >
        Continue →
      </button>
    </div>
  </motion.div>
)}


{/* Step 5 */}
{step === 5 && (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.6 }}
    className="p-4 sm:p-8 rounded-3xl bg-gradient-to-br from-blue-50 via-white to-amber-100 shadow-xl border border-gray-200"
  >
    <h2 className="text-2xl sm:text-4xl font-extrabold text-emerald-900 text-center mb-6 sm:mb-8 flex items-center justify-center gap-2 sm:gap-3">
      <FaMoneyBill className="w-6 h-6 sm:w-10 sm:h-10 text-orange-400" />
      Complete Your Payment
    </h2>

    {/* Bill Summary */}
    {!isProcessing && !paymentDone && (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 sm:mb-10 p-4 sm:p-6 bg-white/70 backdrop-blur-md rounded-2xl border border-orange-200 shadow-md"
      >
        {(() => {
          // Price + total calculation
          const priceMap = { 1: 179, 3: 159, 6: 149 };
          const daysMap = { 1: 30, 3: 90, 6: 180 };

          const perMealPrice = priceMap[selectedMembership] ?? 179;
          const days = daysMap[selectedMembership] ?? 30;
          const mealsPerDay = mealType?.size ? mealType.size : 0;

          const mealsTotal = perMealPrice * mealsPerDay * days;
          const deliveryCharge = 0; // 'Free'
          const platformFee = 4;
          const subTotal = mealsTotal + platformFee;
          const gst = +(subTotal * 0.05).toFixed(2);
          const total = +(subTotal + gst).toFixed(2);

          return (
            <div className="w-full max-w-md mx-auto p-4 sm:p-6 rounded-2xl shadow-lg bg-white/90 border border-emerald-100">
              <h4 className="text-lg font-semibold text-emerald-800 mb-4">Order Summary</h4>

              <div className="text-sm sm:text-base text-gray-700 space-y-2">
                <div className="flex justify-between">
                  <span>Plan</span>
                  <span className="font-medium">
                    {selectedMembership} month{selectedMembership > 1 ? "s" : ""} • ₹{perMealPrice}/meal
                  </span>
                </div>
                <div className="flex justify-between"><span>Meals / day</span><span>{mealsPerDay}</span></div>
                <div className="flex justify-between"><span>Duration</span><span>{days} days</span></div>
                <div className="flex justify-between"><span>Meals cost</span><span>₹{mealsTotal}</span></div>
                <div className="flex justify-between text-gray-600"><span>Delivery</span><span>Free</span></div>
                <div className="flex justify-between text-gray-600"><span>Platform fee</span><span>₹{platformFee}</span></div>

                <div className="border-t my-3"></div>

                <div className="flex justify-between font-semibold">
                  <span>Subtotal</span><span>₹{subTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>GST (5%)</span><span>₹{gst.toFixed(2)}</span>
                </div>

                <div className="border-t my-3"></div>

                <div className="flex justify-between text-xl sm:text-2xl font-bold text-emerald-800">
                  <span>Total</span><span>₹{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          );
        })()}
      </motion.div>
    )}

    {/* Payment Processing */}
   {isProcessing ? (
  <div className="flex flex-col items-center justify-center py-12 sm:py-16 space-y-6">
    <video
      src="/cashflow2.mp4"
      autoPlay
      loop
      muted
      className="w-48 sm:w-64 h-48 sm:h-64 rounded-full object-cover shadow-2xl border-4 border-amber-200"
    />
    <p className="text-orange-700 font-semibold text-base sm:text-lg animate-pulse">Processing Payment...</p>
  </div>
) : paymentDone ? (

      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center justify-center py-12 sm:py-16 space-y-5"
      >
        <CheckCircle className="w-14 h-14 text-green-500 animate-bounce" />
        <p className="text-emerald-800 text-lg sm:text-xl font-semibold text-center">Thank you for joining as a member!</p>
      </motion.div>
    ) : (
      <>
        {/* Payment method selection */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
          {[
            { id: "upi", label: "UPI / QR", icon: <Zap className="w-5 h-5" /> },
            { id: "card", label: "Credit / Debit Card", icon: <CreditCard className="w-5 h-5" /> },
            { id: "wallet", label: "Mobile Wallet", icon: <Wallet className="w-5 h-5" /> },
          ].map((m) => (
            <label
              key={m.id}
              className={`flex items-center gap-3 p-3 sm:p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                paymentMethod === m.id
                  ? "border-orange-400 bg-orange-50 shadow-md"
                  : "border-gray-200 hover:border-orange-300 hover:bg-orange-50/40"
              }`}
            >
              <input
                type="radio"
                name="payment"
                onChange={() => setPaymentMethod(m.id)}
                checked={paymentMethod === m.id}
                className="accent-emerald-600"
              />
              <span className="text-orange-800 font-semibold flex items-center gap-2 text-sm sm:text-base">
                {m.icon} {m.label}
              </span>
            </label>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 sm:mt-10">
          <button
            onClick={prevStep}
            className="px-6 py-2 border-2 rounded-full text-orange-700 border-orange-500 hover:bg-orange-500 hover:text-white font-semibold transition-all"
          >
            ← Back
          </button>
         <button
  onClick={handlePayment}
  disabled={loading}
  className={`px-6 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-full font-semibold shadow-lg transition ${
    loading ? "opacity-70 cursor-not-allowed" : "hover:scale-105"
  }`}
>
  {loading ? "Processing..." : "Pay Now"}
</button>

        </div>
      </>
    )}
  </motion.div>
)}


          </>
        ) : (
          <>
            {/* Nutrition Calculator Tab */}
            <h2 className="text-2xl sm:text-3xl md:text-3xl font-bold text-emerald-900 mb-6 sm:mb-8 flex items-center justify-center gap-2 sm:gap-3">
              <PieChart className="w-6 h-6 text-emerald-600" />
              Nutrition Calculator
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <input
                  type="number"
                  placeholder="Weight (kg)"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full rounded-xl border border-emerald-100 px-3 py-2 text-sm sm:text-base"
                />
                <input
                  type="number"
                  placeholder="Height (cm)"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full rounded-xl border border-emerald-100 px-3 py-2 text-sm sm:text-base"
                />
                <input
                  type="number"
                  placeholder="Age"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full rounded-xl border border-emerald-100 px-3 py-2 text-sm sm:text-base"
                />
                <div className="flex gap-3 mt-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="gender"
                      checked={gender === "male"}
                      onChange={() => setGender("male")}
                      className="accent-emerald-500"
                    />{" "}
                    Male
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="gender"
                      checked={gender === "female"}
                      onChange={() => setGender("female")}
                      className="accent-emerald-500"
                    />{" "}
                    Female
                  </label>
                </div>
                <select
                  value={activity}
                  onChange={(e) => setActivity(e.target.value)}
                  className="w-full rounded-xl border border-emerald-100 px-3 py-2 text-sm sm:text-base"
                >
                  <option value="">Select activity level</option>
                  <option value="sedentary">Sedentary</option>
                  <option value="light">Light</option>
                  <option value="moderate">Moderate</option>
                  <option value="active">Active</option>
                  <option value="very">Very Active</option>
                </select>
                <button
                  onClick={calculateNutrition}
                  className="w-full mt-3 py-2 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition text-sm sm:text-base"
                >
                  Calculate
                </button>
              </div>

              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <h3 className="text-lg sm:text-xl font-semibold text-emerald-900 mb-3">Your Daily Needs</h3>
                {calcResult ? (
                  <div className="grid grid-cols-2 gap-3 text-center">
                    {[
                      { label: "Calories", val: calcResult.tdee },
                      { label: "Protein", val: `${calcResult.proteinG}g` },
                      { label: "Carbs", val: `${calcResult.carbsG}g` },
                      { label: "Fat", val: `${calcResult.fatG}g` },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="p-3 bg-white rounded-xl shadow-sm text-sm sm:text-base"
                      >
                        <div className="text-xl sm:text-2xl font-bold text-emerald-600">{item.val}</div>
                        <div className="text-xs sm:text-sm text-emerald-700">{item.label}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-emerald-700 text-sm">Enter details and press Calculate to see results.</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
