// src/pages/MealPlansPage.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Activity,
  Leaf,
  Scale,
  Dumbbell,
  List,
  Truck,
  Utensils,
} from "lucide-react";
import Header from "../components/Header";
import { useNavigate, useParams } from "react-router-dom";
import { FaMoneyBill } from "react-icons/fa";

const mealPlans = [
  {
    id: 1,
    name: "Keto",
    description:
      "Power up your body with high-fat, low-carb meals crafted to boost fat-burning, support mental clarity, and maintain steady energy all day.",
    features: [
      "< 20g net carbs per day",
      "Healthy fats like avocado & nuts",
      "Moderate protein for muscle support",
      "Boosts energy & focus",
    ],
    image: "/ketogenic-diet.jpg",
    bgImage: "/ketobg.png",
    category: "Keto",
    route: "keto",
    icon: Activity,
    iconColor: "text-emerald-500",
  },
  {
    id: 2,
    name: "Protein",
    description:
      "Fuel your workouts and recovery with protein-rich meals designed for strength, lean muscle growth, and sustained energy.",
    features: [
      "30g+ protein per meal",
      "Lean meats & plant proteins",
      "Optimized for performance & recovery",
      "Supports muscle gain & satiety",
    ],
    image: "/Protein-1184x977.jpg",
    bgImage: "/proteinbg.jpg",
    category: "Protein",
    route: "protein",
    icon: Dumbbell,
    iconColor: "text-red-500",
  },
  {
    id: 3,
    name: "Vegan",
    description:
      "Enjoy delicious, nutrient-packed plant-based dishes that boost your energy, immunity, and overall wellbeing.",
    features: [
      "100% plant-based",
      "High fiber & antioxidants",
      "Natural energy & vitality",
      "Supports digestion & wellness",
    ],
    image: "/Screenshot 2025-10-17 165235.png",
    bgImage: "/veganbg.png",
    category: "Vegan",
    route: "vegan",
    icon: Leaf,
    iconColor: "text-green-500",
  },
  {
    id: 4,
    name: "Weight Loss",
    description:
      "Achieve your goals with calorie-controlled, balanced meals that satisfy your hunger while keeping your nutrition on point.",
    features: [
      "Portion-controlled meals",
      "Balanced macros for fat loss",
      "400–600 calories per serving",
      "Delicious & satisfying flavors",
    ],
    image: "/weightloss.jpeg",
    bgImage: "/weightlossbg.png",
    category: "Weight Loss",
    route: "weight-loss",
    icon: Scale,
    iconColor: "text-blue-500",
  },
];

const categories = [
  { name: "All", icon: List },
  { name: "Keto", icon: Activity },
  { name: "Protein", icon: Dumbbell },
  { name: "Vegan", icon: Leaf },
  { name: "Weight Loss", icon: Scale },
];

export default function MealPlansPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const { type } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (type) {
      const plan = mealPlans.find((p) => p.route === type);
      if (plan) {
        setActiveCategory(plan.category);
        setTimeout(() => {
          const el = document.getElementById(`plan-${plan.id}`);
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 120);
      }
    }
  }, [type]);

  const filteredPlans =
    activeCategory === "All"
      ? mealPlans
      : mealPlans.filter((plan) => plan.category === activeCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-gray-200 text-gray-900 font-sans overflow-x-hidden relative">
      <Header />

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="flex flex-col-reverse md:flex-row items-center justify-between px-6 sm:px-10 md:px-16 lg:px-20 py-12 md:py-20 bg-gradient-to-br from-green-100 via-white to-gray-100"
      >
        {/* Text Side */}
        <motion.div
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full md:w-1/2 max-w-2xl"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-4 md:mb-6 leading-tight">
            Discover Your <br />
            <span className="text-green-500 drop-shadow-sm">Perfect Plan</span>
          </h1>

          <p className="text-gray-800 text-base sm:text-lg md:text-xl mb-6">
            Choose a meal plan that matches your goals — keto, protein-rich,
            plant-based, or weight-loss focused.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3">
            <motion.button
              onClick={() => navigate("/customize")}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="px-5 py-2.5 bg-green-500 text-white font-semibold rounded-full shadow-md hover:shadow-lg transition"
              aria-label="Membership"
            >
              <div className="flex items-center gap-2">
                <FaMoneyBill className="w-4 h-4" />
                <span className="text-sm sm:text-base">Membership</span>
              </div>
            </motion.button>

            <motion.button
              onClick={() => navigate("/Order-history")}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="px-5 py-2.5 bg-white border-2 border-green-500 text-green-600 font-semibold rounded-full shadow-sm hover:shadow-md transition"
              aria-label="Order history"
            >
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4" />
                <span className="text-sm sm:text-base">Order history</span>
              </div>
            </motion.button>
          </div>
        </motion.div>

        {/* Video Side */}
        <motion.div
          initial={{ x: 30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full md:w-1/2 flex justify-center mb-8 md:mb-0"
        >
          <div className="w-full max-w-md sm:max-w-lg md:max-w-xl rounded-full overflow-hidden shadow-2xl border-4 border-gray-200">
            <video
              src="/menupage2.mp4"
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
            />
          </div>
        </motion.div>
      </motion.section>

      {/* Category Buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex justify-center flex-wrap gap-3 my-8 sticky top-20 z-40 px-4"
      >
        {categories.map((cat) => (
          <motion.button
            key={cat.name}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setActiveCategory(cat.name)}
            className={`px-4 sm:px-6 py-2.5 rounded-full text-sm sm:text-base font-medium border transition-all duration-250 backdrop-blur bg-white/60 flex items-center gap-2 ${
              activeCategory === cat.name
                ? "bg-green-600 text-white border-green-600 shadow-md scale-105"
                : "text-gray-800 border-gray-200 hover:bg-green-50 hover:border-green-300"
            }`}
            aria-pressed={activeCategory === cat.name}
          >
            {cat.icon && React.createElement(cat.icon, { className: "w-4 h-4" })}
            {cat.name}
          </motion.button>
        ))}
      </motion.div>

      {/* Meal Plan Cards */}
      <div className="relative space-y-16 px-4 sm:px-8 md:px-12 lg:px-20 pb-24">
        <AnimatePresence>
          {filteredPlans.map((plan) => (
            <motion.section
              key={plan.id}
              id={`plan-${plan.id}`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="relative rounded-3xl overflow-hidden shadow-2xl"
              style={{
                minHeight: 420,
                backgroundImage: `linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.25)), url(${plan.bgImage || plan.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {/* Overlay handled via background gradient; still add fallback */}
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 items-center">
                {/* Image Side */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.35 }}
                  className="w-full p-6 flex items-center justify-center"
                >
                  <img
                    src={plan.image}
                    alt={plan.name}
                    loading="lazy"
                    className="w-44 h-44 sm:w-64 sm:h-64 md:w-72 md:h-72 object-cover rounded-full border-4 border-white/60 shadow-lg"
                  />
                </motion.div>

                {/* Content Side */}
                <div className="w-full p-6 md:pr-12 text-white flex flex-col justify-center">
                  <div className="flex items-center gap-4 mb-4">
                    {plan.icon &&
                      React.createElement(plan.icon, {
                        size: 48,
                        className: `${plan.iconColor} bg-white/80 p-3 rounded-full shadow`,
                      })}
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold">
                      {plan.name} Plan
                    </h2>
                  </div>

                  <p className="text-white/90 text-sm sm:text-base md:text-lg leading-relaxed mb-6">
                    {plan.description}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                    {plan.features.map((feature, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 8 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="bg-white/20 backdrop-blur-md rounded-xl px-3 py-2 text-white text-sm font-medium"
                      >
                        {feature}
                      </motion.div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                    <motion.button
                      onClick={() => navigate(`/select-meals/${plan.route}`)}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-full shadow-md"
                      aria-label={`Select meals for ${plan.name}`}
                    >
                      <div className="flex items-center gap-2">
                        <Utensils className="w-4 h-4" />
                        <span className="text-sm">Select Meals</span>
                      </div>
                    </motion.button>

                    <button
                      onClick={() => navigate(`/mealplan/${plan.route}`)}
                      className="px-6 py-3 bg-white/90 text-gray-800 rounded-full shadow-sm"
                      aria-label={`View ${plan.name} details`}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </motion.section>
          ))}
        </AnimatePresence>
      </div>

      {/* Quick Order Section */}
      <section className="bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-6 text-center rounded-t-3xl shadow-inner">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Quick Order</h2>
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <button
            onClick={() => navigate("/quickorder")}
            className="inline-flex items-center gap-2 px-6 py-3 font-bold text-emerald-600 border-2 border-emerald-500 rounded-xl hover:bg-emerald-50 transition"
          >
            <ShoppingCart className="w-4 h-4" /> Quick Order
          </button>
        </motion.div>
      </section>
    </div>
  );
}
