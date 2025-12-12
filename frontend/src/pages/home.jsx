import React from "react";
import { ChefHat, Calendar, Truck } from "lucide-react";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";
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
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="flex flex-col-reverse md:flex-row items-center justify-between px-6 sm:px-10 md:px-20 py-12 md:py-20 gap-8">
        <div className="w-full md:w-1/2 max-w-xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 md:mb-6 leading-tight">
            Healthy Meals <br /> Delivered Daily —
          </h1>
          <p className="text-gray-600 text-base sm:text-lg mb-6">
            No time to cook? We've got you covered. Choose your diet, customize
            your meals, and get fresh, nutritious food delivered to your doorstep every day.
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-4">
            {/* Start Your Plan Button */}
            <button
              onClick={() => navigate("/mealplan")}
              aria-label="Start Your Plan"
              className="w-full sm:w-auto px-6 py-3 font-bold text-white rounded-xl bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 shadow-md hover:shadow-lg transition transform hover:scale-[1.02]"
            >
              Start Your Plan
            </button>

            {/* How It Works Button */}
            <button
              onClick={() => navigate("/how-it-works")}
              aria-label="How It Works"
              className="w-full sm:w-auto px-6 py-3 font-semibold text-emerald-600 border-2 border-emerald-500 rounded-xl hover:bg-emerald-50 transition"
            >
              How It Works
            </button>
          </div>
        </div>

        <div className="w-full md:w-1/2 flex justify-center items-center">
          {/* On mobile the video becomes a responsive block below text; on desktop it sits right */}
          <video
            src="/puttyhome.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full max-w-xl rounded-2xl shadow-md md:shadow-xl border-2 border-gray-100 object-cover"
            aria-label="Puttybox demo video"
          />
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-white py-12 sm:py-16 px-6 sm:px-10 md:px-20 text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3">How It Works</h2>
        <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
          Getting started is easy. Three simple steps to healthier eating.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
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
              className="bg-emerald-50 p-6 rounded-2xl shadow-sm hover:shadow-md transition transform hover:-translate-y-1"
            >
              <div className="bg-emerald-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                {React.cloneElement(step.icon, { className: "w-6 h-6 text-emerald-600" })}
              </div>
              <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Meal Plans Section */}
      <section className="relative py-16 px-6 md:px-20 bg-gradient-to-br from-emerald-50 via-white to-emerald-100 overflow-hidden">
        {/* Decorative elements hidden on very small screens */}
        <div className="hidden lg:block absolute top-8 left-8 w-56 h-56 bg-emerald-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="hidden lg:block absolute bottom-8 right-8 w-80 h-80 bg-emerald-300/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative text-center mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent mb-4">
            Choose Your Perfect Plan
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-base">
            Every meal is crafted by our expert chefs and nutritionists to match your health goals and flavor preferences.
          </p>
        </div>

        <div className="relative grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {plans.map((plan) => (
            <div
              key={plan.type}
              className="group bg-white/70 backdrop-blur-sm border border-white/50 rounded-2xl shadow-sm hover:shadow-lg transition duration-300 transform hover:-translate-y-2 overflow-hidden"
            >
              {/* Image */}
              <div className="overflow-hidden rounded-t-2xl h-56 sm:h-48 md:h-52 lg:h-56">
                <img
                  src={plan.img}
                  alt={plan.title}
                  loading="lazy"
                  className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Content */}
              <div className="p-4 md:p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{plan.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">{plan.desc}</p>

                <button
                  onClick={() => goToMealPlan(plan.type)}
                  aria-label={`View ${plan.title} details`}
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium rounded-lg shadow-sm hover:from-emerald-600 hover:to-emerald-700 transition-transform duration-200"
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
