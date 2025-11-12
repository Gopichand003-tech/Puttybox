import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import {
  UtensilsCrossed,
  ShoppingBag,
  Truck,
  Smile,
} from "lucide-react";

export default function HowItWorks() {

const navigate = useNavigate();

  const steps = [
    {
      icon: <UtensilsCrossed className="w-10 h-10 text-emerald-600" />,
      title: "1. Choose Your Plan",
      desc: "Select from personalized meal plans like Keto, Vegan, High Protein, or Weight Loss — all crafted by expert nutritionists.",
    },
    {
      icon: <ShoppingBag className="w-10 h-10 text-emerald-600" />,
      title: "2. Customize Your Meals",
      desc: "Adjust your preferences, portion sizes, and ingredients. Add extras or skip meals — full control at your fingertips.",
    },
    {
      icon: <Truck className="w-10 h-10 text-emerald-600" />,
      title: "3. Fresh Delivery",
      desc: "We prepare and deliver freshly cooked meals daily — perfectly packed and always on time at your doorstep.",
    },
    {
      icon: <Smile className="w-10 h-10 text-emerald-600" />,
      title: "4. Enjoy & Track Progress",
      desc: "Enjoy your meals guilt-free and track your health progress with our built-in dashboard and nutrition insights.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-emerald-50 to-emerald-100 py-20 px-6">

     <Header />
     
      <div className="max-w-6xl mx-auto mt-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 mb-6 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-700 font-medium hover:bg-emerald-100 hover:text-emerald-900 transition-all"
        >
          <span className="rotate-180">➔</span> Back
        </button>
       </div>

      <div className="max-w-6xl mx-auto text-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-bold text-gray-800 mb-6"
        >
          How <span className="text-emerald-600">PuttyBox</span> Works
        </motion.h1>
        <p className="text-gray-600 max-w-2xl mx-auto mb-16">
          A simple, smart, and personalized journey — from choosing your plan to savoring your favorite meals every day.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center hover:shadow-2xl transition-shadow duration-300"
            >
              <div className="bg-emerald-100 p-4 rounded-full mb-5">
                {step.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">{step.title}</h3>
              <p className="text-gray-600">{step.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Workflow line animation */}
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: "100%" }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          viewport={{ once: true }}
          className="h-1 bg-emerald-500 rounded-full mt-16 mx-auto w-0 max-w-3xl"
        />

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
          viewport={{ once: true }}
          className="mt-12"
        >
          <button
           onClick={() => navigate("/mealplan")}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-8 py-3 rounded-xl shadow-md transition-all">
            Get Started
          </button>
        </motion.div>
      </div>
    </div>
  );
}
