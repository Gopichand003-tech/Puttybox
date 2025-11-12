// src/pages/MealPlansPage.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, color } from "framer-motion";
import {
  ShoppingCart,
  Activity,
  Leaf,
  Scale,
  Dumbbell,
  UtensilsIcon,
  List,
  Truck,
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
        }, 100);
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
  initial={{ opacity: 0, y: 50 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8 }}
  className="flex flex-col-reverse md:flex-row items-center justify-between px-10 md:px-20 py-16 md:py-24 bg-gradient-to-br from-green-100 via-white to-gray-100"
>
  {/* Text Side */}
  <motion.div
    initial={{ x: -60, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    transition={{ duration: 0.8 }}
    className="max-w-2xl md:pr-10"
  >
   <h1 className="text-6xl md:text-9xl font-extrabold text-gray-900 mb-6 leading-tight ml-4 md:ml-10">
  Discover Your <br />
  <span className="text-green-500 drop-shadow-md">Perfect Plan</span>
</h1>
<p className="text-gray-800 text-xl md:text-2xl mb-9 leading-relaxed ml-2 md:ml-10">
  Choose a meal plan that matches your goals — keto, protein-rich,
  plant-based, or weight-loss focused.
</p>


    {/* Call-to-Action Buttons */}
    <motion.div className="flex flex-wrap gap-2">
      <motion.button
       onClick={() => navigate("/customize")}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="px-6 py-3 bg-green-500 text-white font-semibold rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 ml-2 md:ml-10"
      >
        
       <div className="flex items-center gap-2">
  <FaMoneyBill className="w-5 h-5" />
  <span>Membership</span>
</div>

      </motion.button>
      <motion.button
       onClick={() => navigate("/Order-history")}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="px-6 py-3 bg-white border-2 border-green-500 text-green-600 font-semibold rounded-full shadow hover:shadow-md transition-all duration-300 ml-2 md:ml-10"
      >
        <div className="flex items-center gap-2">
  <Truck className="w-5 h-5" />
  <span>Order history</span>
</div>
      </motion.button>
    </motion.div>
  </motion.div>

  {/* Video Side */}
  <motion.div
    initial={{ x: 60, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    transition={{ duration: 0.8 }}
    className="w-full md:w-1/2 flex justify-center mb-10 md:mb-0"
  >
    <div className="w-98 h-94 md:w-135 md:h-135 object-cover rounded-full overflow-hidden shadow-2xl border-4 border-gray-200">
      <video
        src="/menupage2.mp4" // Replace with your video path
        autoPlay
        muted
        loop
        className="w-full h-full object-cover"
      ></video>
    </div>
  </motion.div>
</motion.section>


      {/* Category Buttons */}
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  className="flex justify-center flex-wrap gap-4 mb-16 sticky top-20 z-40"
>
  {categories.map((cat) => (
    <motion.button
      key={cat.name}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setActiveCategory(cat.name)}
      className={`px-6 py-2.5 rounded-full text-lg font-medium border transition-all duration-300 backdrop-blur-xl flex items-center gap-2 ${
        activeCategory === cat.name
          ? "bg-green-600 text-white border-green-600 shadow-lg scale-105"
          : "bg-white/80 text-gray-800 border-gray-300 hover:bg-green-50 hover:border-green-400"
      }`}
    >
      {cat.icon && React.createElement(cat.icon, { className: "w-5 h-5" })}
      {cat.name}
    </motion.button>
  ))}
</motion.div>

      {/* Meal Plan Cards */}
      <div className="relative space-y-40 px-6 sm:px-10 md:px-20 lg:px-32">
        <AnimatePresence>
          {filteredPlans.map((plan, index) => (
            <motion.section
              key={plan.id}
              id={`plan-${plan.id}`}
              initial={{ opacity: 0, y: 80 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className={`relative flex flex-col md:flex-row items-center justify-between rounded-3xl shadow-2xl overflow-hidden`}
              style={{
                minHeight: "500px",
                backgroundImage: `url(${plan.bgImage || plan.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/40"></div>

              {/* Image Side */}
              <motion.div
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.4 }}
                className="md:w-1/2 w-full relative z-10 p-6"
              >
                <img
                  src={plan.image}
                  alt={plan.name}
                  // className="w-full h-[60vh] md:h-[70vh] object-cover rounded-4xl shadow-lg border-4 border-white/40"
                  className="w-98 h-94 md:w-135 md:h-135 object-cover rounded-full border-7 border-white shadow-xl"

                />
              </motion.div>

              {/* Content Side */}
              <div className="md:w-1/2 w-full p-10 md:pr-16 relative z-10 text-white flex flex-col justify-center">
                {/* Icon & Name */}
                <motion.div className="flex items-center gap-5 mb-6">
                  {plan.icon &&
                    React.createElement(plan.icon, {
                      size: 58,
                      className: `${plan.iconColor} bg-white/70 p-3 rounded-full shadow-md`,
                    })}
                  <h2 className="text-4xl md:text-5xl font-extrabold bg-green-500/70 px-6 py-2 rounded-full shadow-lg">
                    {plan.name} Plan
                  </h2>
                </motion.div>

                <p className="text-white/90 text-lg md:text-xl leading-relaxed mb-8">
                  {plan.description}
                </p>

                {/* Features */}
                <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-white/30 backdrop-blur-md rounded-xl px-4 py-3 text-white font-medium shadow-md"
                    >
                      {feature}
                    </motion.div>
                  ))}
                </div>

                {/* CTA Button */}
                <motion.button
                  onClick={() => navigate(`/select-meals/${plan.route}`)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="mt-4 px-10 py-5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-full text-base shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-3"
                >
                  <UtensilsIcon className="w-5 h-5" /> Select Meals
                </motion.button>
              </div>
            </motion.section>
          ))}
        </AnimatePresence>
      </div>

      {/* Quick Order Section */}
      <section className="bg-gradient-to-br from-gray-50 to-gray-100 py-20 px-6 text-center rounded-t-3xl shadow-inner mt-24">
        <h2 className="text-4xl font-bold text-gray-800 mb-6">Quick Order</h2>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <button
            onClick={() => navigate("/quickorder")}
            className="relative inline-flex items-center justify-center px-8 py-3 overflow-hidden font-bold text-emerald-600 border-2 border-emerald-500 rounded-xl transition-all duration-300 hover:bg-emerald-50 hover:shadow-md hover:scale-105 group"
          >
            <span className="relative flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" /> Quick Order
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </span>
          </button>
        </motion.div>
      </section>
    </div>
  );
}
