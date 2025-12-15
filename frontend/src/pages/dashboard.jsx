import React, { useEffect, useState } from "react";
import axios from "axios";
import io from "socket.io-client";
import { useAuth } from "../context/Authcontext";
import { toast } from "sonner";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";
import { AnimatePresence ,motion } from "framer-motion";

import {
  Crown,
  CheckCircle2,
  Loader2,
  CreditCard,
  Package,
  CalendarDays,
  Star,
  Rocket,
  Handshake,
  Clock,
  LayoutDashboard,
  ClipboardList,
  Truck,
  IndianRupee,
  Utensils,
  Leaf,
  User,
  Timer,
  MapPin,
  Phone
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const [premiumStatus, setPremiumStatus] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInsights, setShowInsights] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [filter, setFilter] = useState("All");
  const [cancelTimers, setCancelTimers] = useState({});
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // ✅ Socket.io setup
  const [socket] = useState(() => io(API_URL));

  // Fetch data
  const fetchData = async () => {
    try {
      const { data: premiumData } = await axios.get(
        `${API_URL}/api/auth/checkPremiumStatus`,
        { withCredentials: true }
      );
      setPremiumStatus(premiumData);

      const { data: orderData } = await axios.get(
        `${API_URL}/api/orders/Get-order`,
        { withCredentials: true }
      );
      setOrders(orderData.orders || []);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 🧩 Socket listeners
  useEffect(() => {
    socket.on("orderCreated", (newOrder) => {
      setOrders((prev) => [newOrder, ...prev]);
      toast.success("New order placed!");
    });

    socket.on("orderUpdated", (updated) => {
      setOrders((prev) =>
        prev.map((o) => (o._id === updated._id ? updated : o))
      );
    });

    socket.on("orderCancelled", (cancelled) => {
      setOrders((prev) =>
        prev.map((o) =>
          o._id === cancelled._id ? { ...o, status: "Cancelled" } : o
        )
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [socket]);

  // 🕒 2-minute cancel timer logic (FIXED)
useEffect(() => {
  const interval = setInterval(() => {
    const now = Date.now();
    const timers = {};
    orders.forEach((order) => {
      const placed = new Date(order.createdAt).getTime();
      const diff = now - placed;
      const remaining = 3 * 60 * 1000 - diff; // 2 minutes

      // 🔧 Fix: normalize status case
      if (remaining > 0 && order.status?.toLowerCase() === "pending") {
        timers[order._id] = remaining;
      }
    });
    setCancelTimers(timers);
  }, 1000);

  return () => clearInterval(interval);
}, [orders]);


 const handleCancelOrder = async (orderId) => {
  try {
    await axios.put(`/api/orders/${orderId}/cancel-order`, {}, { withCredentials: true });
    toast.success("Order cancelled!");

    // 🧹 1. Remove the cancelled order from the timer
    setCancelTimers((prev) => {
      const updated = { ...prev };
      delete updated[orderId];
      return updated;
    });

    // 🔄 2. Update local order list (set status to Cancelled)
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order._id === orderId ? { ...order, status: "Cancelled" } : order
      )
    );
  } catch (err) {
    toast.error("Failed to cancel order");
  }
};


const statusVideos = {
  pending: "/videos/pending.mp4",
  confirmed: "/videos/confirmed.mp4",
  cooking: "/videos/cooking.mp4",
  "out for delivery": "/videos/Delivery.mp4",
  cancelled: "/videos/cancelled.mp4",
  delivered: "/videos/delivered.mp4",
};


  const filteredOrders =
  filter === "All"
    ? orders.filter(o => !["delivered", "cancelled"].includes(o.status?.toLowerCase()))

    : orders.filter(o => o.status === filter);

  const getPlanDuration = () => {
    if (!premiumStatus?.premiumSince || !premiumStatus?.premiumExpiry) return null;
    const start = new Date(premiumStatus.premiumSince);
    const end = new Date(premiumStatus.premiumExpiry);
    let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    if (end.getDate() > start.getDate()) months++;
    return Math.max(months, 1);
  };

  const handleActivatePremium = (months) => {
    navigate(`/customize?plan=${months}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600 dark:text-gray-300 text-lg font-medium">
        <Loader2 className="animate-spin mr-2" size={24} />
        Loading your dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 transition-colors duration-500">
      <Header />

<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 mt-16">
        {/* --- Tabs --- */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">

          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition ${
              activeTab === "dashboard"
                ? "bg-indigo-600 text-white shadow-md"
                : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            <LayoutDashboard size={18} />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition ${
              activeTab === "orders"
                ? "bg-indigo-600 text-white shadow-md"
                : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            <ClipboardList size={18} />
            Orders
          </button>
        </div>

        {/* --- DASHBOARD TAB --- */}
        {activeTab === "dashboard" && (
          <>
            {/* --- Welcome Section --- */}
            <div className="mb-10 text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center justify-center md:justify-start gap-3">
                Welcome back,{" "}
                <span className="text-indigo-600 dark:text-indigo-400">
                  {user?.name || "Champion"}
                </span>
                <Handshake className="w-12 h-12 text-yellow-500 dark:text-indigo-400 animate-bounce mt-10" />
              </h1>

              <p className="text-lg text-gray-600 dark:text-gray-300 mt-3 max-w-2xl leading-relaxed mx-auto md:mx-0">
                Great to see you again! Here’s your personalized dashboard — track your{" "}
                <span className="font-semibold text-indigo-500">premium stats</span>,
                explore new features, and stay on top of your goals{" "}
                <Rocket className="inline-block w-7 h-7 text-indigo-600 dark:text-indigo-400 animate-bounce" />
              </p>

              <div className="mt-6 flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
                <button
                  onClick={() => setShowInsights(!showInsights)}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition duration-300 flex items-center gap-2"
                >
                  <Rocket className="w-5 h-5" />
                  {showInsights ? "Hide Premium Insights" : "View Premium Insights"}
                </button>

                <button
                  onClick={() => navigate("/update-profile")}
                  className="px-6 py-3 bg-gray-100 dark:bg-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl shadow-sm transition duration-300"
                >
                  Edit Profile
                </button>
              </div>

              {/* ---- Premium Insights ---- */}
              {showInsights && (
                <div className="mt-8 bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 transition-all duration-500">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2 mb-4">
                    <Crown className="text-yellow-500 w-6 h-6" /> Premium Membership
                  </h2>

                  {premiumStatus?.isPremium ? (
                    <div className="space-y-3 text-gray-700 dark:text-gray-300">
                      <p className="flex items-center gap-2">
                        <CalendarDays className="w-5 h-5 text-indigo-500" />
                        <span>
                          <strong>Activated:</strong>{" "}
                          {new Date(premiumStatus.premiumSince).toLocaleDateString("en-GB")}
                        </span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-indigo-500" />
                        <span>
                          <strong>Expires:</strong>{" "}
                          {new Date(premiumStatus.premiumExpiry).toLocaleDateString("en-GB")}
                        </span>
                      </p>
                      <p className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium">
  <CheckCircle2 className="w-5 h-5" />
  Premium status: Active ({getPlanDuration()} month
  {getPlanDuration() > 1 ? "s" : ""})
</p>

                    </div>
                  ) : (
                    <p className="text-gray-600 dark:text-gray-400 italic">
                      You’re currently on a free plan. Upgrade now to unlock premium features 🚀
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* --- Stats Cards --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">

              <div className="bg-white dark:bg-gray-800 shadow-md rounded-2xl p-5 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-3">
                  <Crown className="text-yellow-500" size={28} />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Current Plan</p>
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                      {premiumStatus?.isPremium
                        ? `Premium (${getPlanDuration()} month${
                            getPlanDuration() > 1 ? "s" : ""
                          })`
                        : "Free"}
                    </h2>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 shadow-md rounded-2xl p-5 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-3">
                  <Package className="text-blue-500" size={28} />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Orders</p>
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                      {orders.length}
                    </h2>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 shadow-md rounded-2xl p-5 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-3">
                  <CalendarDays className="text-green-500" size={28} />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Member Since</p>
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                      {premiumStatus?.isPremium && premiumStatus?.premiumSince
                        ? new Date(premiumStatus.premiumSince).toLocaleDateString("en-GB")
                        : "Not Premium Yet"}
                    </h2>
                  </div>
                </div>
              </div>
            </div>

            {/* --- Premium Card --- */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 mb-10 transition-all duration-300">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Crown className="text-yellow-500" />
                Premium Membership
              </h2>

              {premiumStatus?.isPremium ? (
                <div className="flex items-center gap-3 text-green-600 dark:text-green-400 font-medium">
                  <CheckCircle2 />
                  Your premium plan is active for{" "}
                  <span className="ml-1 font-semibold">
                    {getPlanDuration()} month{getPlanDuration() > 1 ? "s" : ""}
                  </span>
                  , expiring on{" "}
                  <span className="ml-1 font-semibold">
                    {new Date(premiumStatus.premiumExpiry).toLocaleDateString("en-GB")}
                  </span>
                </div>
              ) : (
                <div>
                  <p className="text-gray-600 dark:text-gray-400 mb-5">
                    Unlock exclusive features and advanced access by upgrading to Premium.
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { label: "1 Month", value: "1m", color: "bg-indigo-600" },
                      { label: "3 Months", value: "3m", color: "bg-blue-600" },
                      { label: "6 Months", value: "6m", color: "bg-teal-600" },
                    ].map((plan) => (
                      <button
                        key={plan.value}
                        onClick={() => handleActivatePremium(plan.value)}
                        className={`${plan.color} hover:brightness-110 text-white py-2 rounded-xl font-medium transition transform hover:-translate-y-1 flex items-center justify-center gap-2 shadow-md`}
                      >
                        <Star size={16} />
                        {plan.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}


{/* ORDERS & HISTORY TAB (with user details + delivery charges) */}
{["orders", "history"].includes(activeTab) && (
  <div className="bg-white/80 dark:bg-gray-800/90 p-4 sm:p-6 lg:p-8 rounded-2xl shadow-xl">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
        <CreditCard className="text-indigo-700" />
        {activeTab === "orders" ? "Active Orders" : "Order History"}
      </h2>

      <div className="flex gap-3">
        <button
          onClick={() => setActiveTab("orders")}
          className={`px-5 py-2 rounded-full font-medium transition ${
            activeTab === "orders"
              ? "bg-indigo-600 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-gray-600"
          }`}
        >
          Orders
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-5 py-2 rounded-full font-medium transition ${
            activeTab === "history"
              ? "bg-indigo-600 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-gray-600"
          }`}
        >
          History
        </button>
      </div>
    </div>

    {activeTab === "orders" && (
      <>
       <div className="flex gap-3 mb-8 overflow-x-auto scrollbar-hide py-2">

          {["All", "pending", "confirmed", "cooking", "Out for Delivery"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-5 py-2 text-sm rounded-full font-medium transition ${
                filter === tab
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-gray-600"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {filteredOrders.filter(o => o.status !== "Delivered" && o.status !== "Cancelled").length ? (
          <ul className="space-y-6">
            {filteredOrders
             .filter(o => !["delivered", "cancelled"].includes(o.status?.toLowerCase()))
              .map((order, i) => {
                const remaining = cancelTimers[order._id] || 0;
                const deliveryCharge = premiumStatus?.isPremium ? 0 : 40;
                const displayTotal = order.total || 0; // Use backend-calculated total directly
                return (
                  <motion.li
                    key={order._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm hover:shadow-lg transition"
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                          <Utensils className="text-indigo-500" />
                          {order.items?.map((it) => it.name).join(", ")}
                        </h3>

                      {/* customer + address */}
<div className="mt-3 text-sm text-gray-600 dark:text-gray-300 space-y-2">
  {/* 👤 Customer */}
  <div className="flex items-center gap-2">
    <User className="w-4 h-4 text-indigo-500" />
    <span className="font-medium text-gray-800 dark:text-gray-100">Customer:</span>
    <span>{order.user?.name || order.customerName || "Unknown"}</span>
    {order.user?.email && (
      <span className="ml-2 text-xs text-gray-500">({order.user.email})</span>
    )}
  </div>

  {/* 📍 Address */}
  {order.address && (
    <div className="flex items-start gap-2">
      <MapPin className="w-4 h-4 mt-0.5 text-green-600" />
      <span className="font-medium text-gray-800 dark:text-gray-100">Address:</span>
      <span className="text-gray-600 dark:text-gray-300">{order.address}</span>
    </div>
  )}

  {/* 📞 Phone */}
  {order.phone && (
    <div className="flex items-center gap-2">
      <Phone className="w-4 h-4 text-blue-500" />
      <span className="font-medium text-gray-800 dark:text-gray-100">Phone:</span>
      <span className="text-gray-600 dark:text-gray-300">{order.phone}</span>
    </div>
  )}

  {/* ⏰ Time */}
  <div className="flex items-center gap-2 text-xs text-orange-700 mt-1">
    <Clock className="w-3 h-3" />
    <span>{new Date(order.createdAt).toLocaleString("en-GB")} (ordered time)</span>
  </div>
</div>
</div>


                   <div className="flex-shrink-0 w-full sm:w-auto flex flex-col sm:items-end items-start gap-3">

  {/* 💰 Price & Delivery Section */}
  <div className="text-right">
    <div className="text-xl font-bold flex items-center justify-end gap-1 text-gray-900 dark:text-gray-100">
      <IndianRupee className="w-4 h-4 text-indigo-500" />
      {displayTotal}
    </div>

    <div className="text-sm text-gray-500 mt-1 space-y-0.5">
      <div>
        <span className="mr-1">Subtotal:</span>
        <strong>₹{order.total ?? 0}</strong>
      </div>
      <div className="flex items-center justify-end gap-1">
        <span className="mr-1">Delivery:</span>
        {deliveryCharge === 0 ? (
          <span className="text-green-600 font-medium flex items-center gap-1">
            <Crown className="w-4 h-4 text-yellow-400" /> Free
          </span>
        ) : (
          <span className="text-red-600 font-medium">₹{deliveryCharge}</span>
        )}
      </div>
    </div>
  </div>

  {/* 🟡 Status Badge */}
  <span
    className={`px-4 py-1.5 rounded-full text-sm font-semibold capitalize shadow-sm ${
      order.status?.toLowerCase() === "delivered"
        ? "bg-green-100 text-green-700"
        : order.status?.toLowerCase() === "pending"
        ? "bg-yellow-100 text-yellow-700"
        : order.status?.toLowerCase() === "cancelled"
        ? "bg-red-100 text-red-700"
        : "bg-blue-100 text-blue-700"
    }`}
  >
    {order.status}
  </span>

  {/* ❌ Cancel Button with Timer */}
  <AnimatePresence>
    {remaining > 0 && order.status?.toLowerCase() === "pending" && (
      <motion.button
        key="cancel-button"
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -5 }}
        transition={{ duration: 0.3 }}
        onClick={() => handleCancelOrder(order._id)}
        className="flex items-center justify-center gap-1 px-3 py-1 text-xs sm:text-sm rounded-full bg-red-500 hover:bg-red-600 text-white shadow-md hover:shadow-lg transition-all"
      >
        <Timer className="w-4 h-4 animate-pulse" />
        Cancel ({Math.ceil(remaining / 1000)}s)
      </motion.button>
    )}
  </AnimatePresence>
</div>

                    </div>

  <div className="mt-6 flex justify-center">
  <div className="relative w-36 h-36 sm:w-48 sm:h-48 lg:w-56 lg:h-56 rounded-full overflow-hidden shadow-lg border-4 border-indigo-500/70 bg-white">
   <motion.video
  key={order.status}
  src={statusVideos[order.status?.toLowerCase()] || "/videos/default.mp4"}
  autoPlay
  muted
  loop
  playsInline
  className="w-full h-full object-cover rounded-full"
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.8, ease: "easeInOut" }}
/>


    {/* Status label overlay */}
    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-xs sm:text-sm font-medium backdrop-blur-sm">
      {order.status}
    </div>
  </div>
</div>

                  </motion.li>
                );
              })}
          </ul>
        ) : (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            <CreditCard className="mx-auto mb-4 w-12 h-12 text-gray-400 animate-bounce" />
            <p className="text-xl font-semibold mb-1">No active orders</p>
            <p className="text-sm">Place a new order to get started!</p>
          </div>
        )}
      </>
    )}

{activeTab === "history" && (
  <>
    {orders.filter(o => ["delivered", "cancelled"].includes(o.status?.toLowerCase())).length ? (
      <ul className="space-y-6">
        {orders
          .filter(o => ["delivered", "cancelled"].includes(o.status?.toLowerCase()))
          .map((order, i) => {
            const deliveryCharge = premiumStatus?.isPremium ? 0 : 40;
            const displayTotal = (order.total ?? 0) + deliveryCharge;
            const status = order.status?.toLowerCase();

            return (
              <motion.li
                key={order._id}
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                transition={{ delay: i * 0.06, duration: 0.4, ease: "easeOut" }}
                className="relative overflow-hidden p-6 bg-gradient-to-br from-white/90 via-white/60 to-gray-100/70 dark:from-gray-900/90 dark:via-gray-800/70 dark:to-gray-900/60 
                           border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-lg backdrop-blur-md hover:shadow-indigo-500/20 transition-all"
              >
                {/* 🔹 Decorative glowing gradient ring */}
                <div className={`absolute inset-0 rounded-2xl opacity-20 blur-xl pointer-events-none ${
                  status === "delivered"
                    ? "bg-gradient-to-r from-green-400 via-emerald-500 to-teal-400"
                    : "bg-gradient-to-r from-red-400 via-rose-500 to-pink-500"
                }`}></div>

                <div className="relative flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 z-10">
{/* Left section — details */}
<div className="flex-1">
  <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
    <Utensils className="text-indigo-500" />
    {order.items?.map(it => it.name).join(", ")}
  </h3>

  {/* 🕒 Ordered Time */}
  <p className="text-sm text-orange-500 mt-1 flex items-center gap-1">
    <Clock className="w-4 h-4 text-orange-400" />
    {new Date(order.createdAt).toLocaleString("en-GB")}
  </p>

  {/* 👤 Customer, Address, Phone */}
  <div className="mt-3 text-sm text-gray-900 dark:text-gray-300 space-y-2">
    {/* Customer */}
    <div className="flex items-center gap-2">
      <User className="w-4 h-4 text-indigo-500" />
      <span className="font-medium text-gray-800 dark:text-gray-200">Customer:</span>
      <span>{order.user?.name || order.customerName || "Unknown"}</span>
      {order.user?.email && (
        <span className="ml-2 text-xs text-gray-600 dark:text-gray-400">
          ({order.user.email})
        </span>
      )}
    </div>

    {/* Address */}
    {order.address && (
      <div className="flex items-start gap-2">
        <MapPin className="w-4 h-4 text-green-600 mt-0.5" />
        <span className="font-medium text-gray-800 dark:text-gray-200">Address:</span>
        <span className="text-gray-700 dark:text-gray-400">{order.address}</span>
      </div>
    )}

    {/* Phone */}
    {order.phone && (
      <div className="flex items-center gap-2">
        <Phone className="w-4 h-4 text-blue-600" />
        <span className="font-medium text-gray-800 dark:text-gray-200">Phone:</span>
        <a
          href={`tel:${order.phone}`}
          className="text-gray-700 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
        >
          {order.phone}
        </a>
      </div>
    )}
  </div>
</div>


                  {/* Right section — price, status, and video */}
                  <div className="flex flex-col items-end gap-3 text-right">
                    {/* 💰 Price */}
                    <div className="text-2xl font-semibold flex items-center gap-1 text-gray-900 dark:text-gray-100">
                      <IndianRupee className="w-4 h-4 text-indigo-500" />
                      {displayTotal}
                    </div>

                    {/* 🏷️ Status badge */}
                    <div
                      className={`px-3 py-1.5 rounded-full text-sm font-semibold capitalize shadow-md transition-all ${
                        status === "delivered"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300"
                          : "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300"
                      }`}
                    >
                      {order.status}
                    </div>

                    {/* 🎬 Delivered / Cancelled video circle */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.08, rotate: 2 }}
                      transition={{ duration: 0.6 }}
                     className={`relative w-16 h-16 sm:w-25 sm:h-25 rounded-full overflow-hidden shadow-xl ring-4 animate-pulse ${
  status === "delivered"
    ? "ring-green-400/40 shadow-green-300/30"
    : "ring-red-400/40 shadow-red-300/30"
}`}

                    >
                      <motion.video
                        src={status === "delivered" ? statusVideos.delivered : statusVideos.cancelled}
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="w-full h-full object-cover rounded-full"
                      />
                      <div
                        className={`absolute bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium tracking-wide backdrop-blur-md ${
                          status === "delivered"
                            ? "bg-green-600/80 text-white"
                            : "bg-red-600/80 text-white"
                        }`}
                      >
                        {status === "delivered" ? "Delivered" : "Cancelled"}
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.li>
            );
          })}
      </ul>
    ) : (
      <div className="text-center py-16 text-gray-500 dark:text-gray-400">
        <ClipboardList className="mx-auto mb-4 w-12 h-12 text-gray-400 animate-bounce" />
        <p className="text-xl font-semibold mb-1">No completed orders</p>
        <p className="text-sm">Delivered and cancelled orders will appear here.</p>
      </div>
    )}
  </>
)}
  </div>
)}

      </div>
    </div>
  );
}
