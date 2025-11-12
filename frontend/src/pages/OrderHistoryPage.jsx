import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  Loader2,
  Package,
  Calendar,
  Dumbbell,
  Leaf,
  Flame,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";
import Header from "../components/Header";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

axios.defaults.withCredentials = true;

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  // ✅ Fetch order history
  const fetchOrders = useCallback(async () => {
    try {
      setRefreshing(true);
      const res = await axios.get("/api/mealorder/user");
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error("❌ Failed to load order history:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000); // 10s polling
    return () => clearInterval(interval);
  }, [fetchOrders]);

  // ✅ Handle reorder
  async function handleReorder(orderId) {
    try {
      toast.loading("Reordering your box...");
      const res = await axios.post(`/api/mealorder/reorder/${orderId}`);
      toast.dismiss();

      if (res.status === 201) {
        toast.success("✅ Box reordered successfully!");
        fetchOrders(); // instant refresh
      } else {
        toast.error("Something went wrong while reordering.");
      }
    } catch (err) {
      toast.dismiss();
      console.error("❌ Reorder error:", err);
      toast.error("Failed to reorder box.");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-600">
        <Loader2 className="animate-spin h-8 w-8 text-emerald-500 mb-3" />
        <p className="text-gray-500">Loading your meal history...</p>
      </div>
    );
  }

  // 🎨 Color palette
  const planColors = {
    protein: {
      bg: "bg-red-50",
      border: "border-red-200",
      accent: "text-red-700",
      icon: <Dumbbell className="w-5 h-5 text-red-600" />,
    },
    balanced: {
      bg: "bg-teal-50",
      border: "border-teal-200",
      accent: "text-teal-700",
      icon: <Flame className="w-5 h-5 text-teal-600" />,
    },
    vegan: {
      bg: "bg-green-50",
      border: "border-green-200",
      accent: "text-green-700",
      icon: <Leaf className="w-5 h-5 text-green-600" />,
    },
    default: {
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      accent: "text-emerald-700",
      icon: <Package className="w-5 h-5 text-emerald-600" />,
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white py-10 px-4">
      <Header />

      {/* ✅ Back button */}
      <div className="max-w-6xl mx-auto mb-4 mt-14">
        <motion.button
          onClick={() => navigate(-1)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 text-emerald-700 font-medium bg-emerald-100 hover:bg-emerald-200 transition-colors px-4 py-2 rounded-lg shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </motion.button>
      </div>

      <main className="max-w-6xl mx-auto mt-6">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-extrabold text-emerald-800 mb-8 text-center flex items-center justify-center gap-3"
        >
          <Package className="w-10 h-10 text-emerald-600" />
          Meal Box History
          {refreshing && (
            <Loader2 className="animate-spin w-5 h-5 ml-2 text-emerald-500" />
          )}
        </motion.h1>

        {orders.length === 0 ? (
          <div className="text-center text-gray-600 mt-24">
            <p className="text-lg">No meal orders yet 🥺</p>
            <p className="text-sm mt-1 text-gray-500">
              Start customizing your first meal box!
            </p>
          </div>
        ) : (
          <motion.div
            layout
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 place-items-center"
          >
            <AnimatePresence>
              {orders.map((order) => {
                const type = (order.planType || "").toLowerCase();
                const color = planColors[type] || planColors.default;

                return (
                  <motion.div
                    key={order._id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ scale: 1.04, y: -4 }}
                    className={`relative w-full bg-white overflow-hidden rounded-2xl shadow-lg border ${color.border} ${color.bg} transition-all duration-300`}
                  >
                    <div
                      className={`absolute top-0 left-0 w-full h-2 ${color.accent.replace(
                        "text",
                        "bg"
                      )}`}
                    ></div>

                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {color.icon}
                          <h3
                            className={`text-xl font-bold capitalize ${color.accent}`}
                          >
                            {order.planType} Plan
                          </h3>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded-md font-semibold ${
                            order.status === "delivered"
                              ? "bg-green-100 text-green-700"
                              : order.status === "in-progress"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {order.status || "Scheduled"}
                        </span>
                      </div>

                      <p className="text-sm text-orange-700 flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>

                      <div className="mt-4">
                        <h4 className="font-semibold text-gray-800 mb-1">
                          Selected Meals:
                        </h4>
                        <ul className="text-sm text-gray-700 space-y-1 max-h-24 overflow-y-auto pr-1">
                          {Object.values(order.selected || {}).map((meal) => (
                            <li
                              key={meal.name}
                              className="flex items-center gap-1"
                            >
                              🍽 <span>{meal.name}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {order.proteinTarget && (
                        <p className="mt-3 text-sm font-medium text-gray-600">
                          Protein Target:{" "}
                          <span className="text-emerald-700 font-semibold">
                            {order.proteinTarget}g
                          </span>
                        </p>
                      )}
                    </div>

                    {/* Reorder button */}
                    <div className="p-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-center">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleReorder(order._id)}
                        className="flex items-center justify-center gap-2 text-white font-semibold w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 transition-all"
                      >
                        <RefreshCw className="w-4 h-4" /> Reorder This Box
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </main>
    </div>
  );
}
