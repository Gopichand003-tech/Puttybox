import React from "react";
import { ChefHat, Calendar, Truck } from "lucide-react";
import Header from "../components/Header";
import { useNavigate,Link } from "react-router-dom";
import Footer from "../components/Footer";

const plans = [
  {
    type: "keto",
    title: "Keto",
    img: "/ketogenic-diet.jpg",
    desc: "High fat, low carb meals designed to keep you in ketosis.",
    prefs: ["Non-Veg", "Low Carb", "No Sugar"],
  },
  {
    type: "protein",
    title: "High Protein",
    img: "/Protein-1184x977.jpg",
    desc: "Protein-packed meals perfect for muscle building and recovery.",
    prefs: ["Veg", "Non-Veg", "Protein Rich"],
  },
  {
    type: "vegan",
    title: "Vegan",
    img: "/Screenshot 2025-10-17 165235.png",
    desc: "100% plant-based, nutrient-rich meals full of flavor.",
    prefs: ["Veg", "No Dairy", "Organic"],
  },
  {
    type: "weight-loss",
    title: "Weight Loss",
    img: "/weightloss.jpeg",
    desc: "Calorie-controlled, balanced meals to support your goals.",
    prefs: ["Veg", "Low Calorie", "Gluten-Free"],
  },
];

export default function Home() {
  const navigate = useNavigate();

  const goToMealPlan = (planType) => {
    navigate(`/mealplan/${planType.toLowerCase()}`);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="flex flex-col-reverse md:flex-row items-center justify-between px-10 md:px-20 py-16 md:py-24">
        <div className="max-w-xl">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
            Healthy Meals <br /> Delivered Daily —
          </h1>
          <p className="text-gray-600 text-lg mb-8">
            No time to cook? We've got you covered. Choose your diet, customize
            your meals, and get fresh, nutritious food delivered to your doorstep every day.
          </p>
        
<div className="flex flex-wrap gap-4 mt-6">
      {/* Start Your Plan Button */}
      <button
        onClick={() => navigate("/mealplan")}
        className="relative inline-flex items-center justify-center px-8 py-3 overflow-hidden font-bold text-white rounded-xl bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 shadow-lg transition-all duration-300 hover:shadow-emerald-500/40 hover:scale-105 group"
      >
        <span className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-700 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
        <span className="relative flex items-center gap-2">
          Start Your Plan
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </button>

      {/* How It Works Button */}
      <button
        onClick={() => navigate("/how-it-works")}
        className="relative inline-flex items-center justify-center px-8 py-3 overflow-hidden font-bold text-emerald-600 border-2 border-emerald-500 rounded-xl transition-all duration-300 hover:bg-emerald-50 hover:shadow-md hover:scale-105 group"
      >
        <span className="relative flex items-center gap-2">
          How It Works
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </button>
    </div>


        </div>

        <div className="w-full md:w-1/2 mb-10 md:mb-0">
          <video
            src="/puttyhome.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full rounded-2xl shadow-xl border-4 border-gray-200"
          />
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-white py-20 px-10 md:px-20 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
        <p className="text-gray-600 mb-12">
          Getting started is easy. Three simple steps to healthier eating.
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <ChefHat />,
              title: "Choose Your Plan",
              desc: "Select from Keto, High Protein, Vegan, Weight Loss, and more diet-specific plans tailored to your goals.",
            },
            {
              icon: <Calendar />,
              title: "Customize Your Meals",
              desc: "Pick your preferences, dietary restrictions, and portion sizes. We'll create a personalized menu just for you.",
            },
            {
              icon: <Truck />,
              title: "Get Fresh Delivery",
              desc: "Receive your meals daily, weekly, or monthly. Fresh ingredients, chef-prepared, delivered to your door.",
            },
          ].map((step, i) => (
            <div
              key={i}
              className="bg-emerald-50 p-8 rounded-2xl shadow-md hover:shadow-xl transition transform hover:-translate-y-2"
            >
              <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                {React.cloneElement(step.icon, { className: "w-8 h-8 text-emerald-600" })}
              </div>
              <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-gray-600">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

     {/* 🌿 Meal Plans Section */}
<section className="relative py-24 px-6 md:px-20 bg-gradient-to-br from-emerald-50 via-white to-emerald-100 overflow-hidden">
  {/* Background Decorative Elements */}
  <div className="absolute top-10 left-10 w-72 h-72 bg-emerald-200/30 rounded-full blur-3xl"></div>
  <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-300/20 rounded-full blur-3xl"></div>

  {/* Title Section */}
  <div className="relative text-center mb-16">
    <h2 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent mb-4">
      Choose Your Perfect Plan
    </h2>
    <p className="text-gray-600 max-w-2xl mx-auto text-lg">
      Every meal is crafted by our expert chefs and nutritionists to match your health goals and flavor preferences.
    </p>
  </div>

  {/* Cards Grid */}
  <div className="relative grid md:grid-cols-4 sm:grid-cols-2 gap-10 ">
    {plans.map((plan) => (
      <div
        key={plan.type}
        className="group bg-white/60 backdrop-blur-md border border-white/50 rounded-2xl shadow-lg hover:shadow-2xl transition duration-300 hover:-translate-y-2"
      >
        {/* Image */}
        <div className="overflow-hidden rounded-t-2xl">
          <img
            src={plan.img}
            alt={plan.title}
            className="w-full h-56 object-cover transition duration-500 group-hover:scale-110"
          />
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.title}</h3>
          <p className="text-gray-600 text-sm leading-relaxed mb-6">{plan.desc}</p>

          <button
            onClick={() => goToMealPlan(plan.type)}
            className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium rounded-lg shadow-md transition-transform duration-300 transform group-hover:scale-105"
          >
            View Details
          </button>
        </div>
      </div>
    ))}
  </div>
</section>

      <Footer />
    </div>
  );
}
