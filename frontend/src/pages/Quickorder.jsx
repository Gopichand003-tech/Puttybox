// src/pages/QuickOrder.jsx
import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { mealData } from "../data/mealData";
import axios from "axios";
import { toast } from "sonner";
import { useAuth } from "../context/Authcontext";
import { useNavigate } from "react-router-dom";
import {
  Loader2,
  UtensilsCrossed,
  Apple,
  Salad,
  Dumbbell,
  Leaf,
  MapPin,
  Phone,
  Home,
  Landmark,
  CreditCard,
  Plus,
  Minus,
} from "lucide-react";

/**
 * QuickOrder — Responsive v2
 * Improvements:
 *  - Mobile-first layout (stacking, spacing, full-width CTAs)
 *  - Responsive video sizes and intro bubble
 *  - Larger tap targets for qty controls and add/remove
 *  - Sticky checkout on small screens (keeps actions reachable)
 */

export default function QuickOrder() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Delivery charge logic (example)
  const deliveryCharge = user?.isPremium ? 0 : 40;

  const [mealType, setMealType] = useState(null);
  const [selectedMap, setSelectedMap] = useState({}); // id -> { item, qty }
  const [doorNo, setDoorNo] = useState("");
  const [landmark, setLandmark] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [payment, setPayment] = useState("cod");
  const [loading, setLoading] = useState(false);
  const [showPaymentVideo, setShowPaymentVideo] = useState(false);
  const [showWorkerVideo, setShowWorkerVideo] = useState(false);

  // helper: total price
  const totalPrice = useMemo(() => {
    return Object.values(selectedMap).reduce(
      (sum, s) => sum + (s.item.price || 0) * (s.qty || 1),
      0
    );
  }, [selectedMap]);

  // Toggle add/remove item. When adding, default qty = 1
  const toggleItem = (item) => {
    setSelectedMap((prev) => {
      if (prev[item.id]) {
        const copy = { ...prev };
        delete copy[item.id];
        return copy;
      } else {
        return { ...prev, [item.id]: { item, qty: 1 } };
      }
    });
  };

  // Increase/decrease quantity (min 1)
  const changeQty = (id, delta) => {
    setSelectedMap((prev) => {
      const entry = prev[id];
      if (!entry) return prev;
      const newQty = Math.max(1, (entry.qty || 1) + delta);
      return { ...prev, [id]: { ...entry, qty: newQty } };
    });
  };

  // helpers for UI state: whether we are in the middle of a "pre-order" video flow
  const busy = loading || showPaymentVideo || showWorkerVideo;

  // main click handler for Place Order
  const handlePlaceOrderClick = async () => {
    // client-side validation
    if (!mealType) {
      toast.error("Please choose a meal type.");
      return;
    }
    if (Object.keys(selectedMap).length === 0) {
      toast.error("Select at least one meal item.");
      return;
    }
    if (!doorNo || !landmark || !address || !phone) {
      toast.error("Please fill door no., landmark, full address and phone.");
      return;
    }
    if (!/vijayawada/i.test(address)) {
      toast.error("Sorry — we deliver only within Vijayawada.");
      return;
    }
    if (!user || (!user._id && !user.id)) {
      toast.error("Please log in to place an order.");
      return;
    }

    try {
      // When online payment chosen -> first show payment video, then worker video + finalize
      if (payment === "online") {
        setShowPaymentVideo(true);
        // play payment video for ~2.5s then hide and proceed to worker flow
        setTimeout(async () => {
          setShowPaymentVideo(false);
          await playWorkerAndFinalize();
        }, 2500);
      } else {
        // COD -> show worker animation briefly then finalize
        await playWorkerAndFinalize();
      }
    } catch (err) {
      console.error("Order flow error:", err);
      toast.error("Something went wrong during ordering flow.");
      setShowPaymentVideo(false);
      setShowWorkerVideo(false);
      setLoading(false);
    }
  };

  // helper: play worker video then call finalizeOrder
  const playWorkerAndFinalize = async () => {
    setShowWorkerVideo(true);
    // keep worker video on screen for ~1.8s
    await new Promise((res) => setTimeout(res, 1800));
    setShowWorkerVideo(false);
    await finalizeOrder();
  };

  // finalize: actual HTTP request
  const finalizeOrder = async () => {
    setLoading(true);
    try {
      const items = Object.values(selectedMap).map((s) => ({
        name: s.item.name,
        price: s.item.price,
        calories: s.item.calories,
        quantity: s.qty,
      }));

      const payload = {
        mealType,
        items,
        address: `Door No: ${doorNo}, ${address}, Landmark: ${landmark}`,
        phone,
        paymentMethod: payment,
        total: totalPrice + deliveryCharge,
      };

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/orders/quick-order`,
        payload,
        { withCredentials: true }
      );

      toast.success(res.data.message || "Order placed — enjoy your healthy meal!");
      // reset UI
      setSelectedMap({});
      setDoorNo("");
      setLandmark("");
      setAddress("");
      setPhone("");
      setMealType(null);
      setPayment("cod");
    } catch (err) {
      console.error("Order error:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Failed to place order. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // small util to format currency
  const formatINR = (n) => `₹${Number(n || 0).toFixed(0)}`;

  // UI: item card component (responsive & touch-friendly)
  const FoodCard = ({ item }) => {
    const selected = !!selectedMap[item.id];
    const qty = selectedMap[item.id]?.qty ?? 0;

    return (
      <motion.div
        layout
        whileHover={{ scale: 1.01 }}
        className="relative group rounded-2xl p-4 bg-white/90 dark:bg-gray-900/80 border border-green-100/30 dark:border-gray-700 shadow-sm"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 dark:text-white">{item.name}</h4>
            <p className="text-xs text-gray-500 mt-1">{item.calories} kcal • diet-friendly</p>

            <div className="mt-3 flex items-center gap-3">
              <span className="text-lg font-bold text-green-700 dark:text-green-300">{formatINR(item.price)}</span>

              {/* qty controls when selected */}
              {selected ? (
                <div className="flex items-center gap-2 bg-white/70 dark:bg-gray-800/60 p-1 rounded-full border border-gray-200/40">
                  <button
                    aria-label={`decrease ${item.name}`}
                    onClick={() => changeQty(item.id, -1)}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800/60 active:scale-95"
                  >
                    <Minus size={16} />
                  </button>
                  <div className="px-3 min-w-[36px] text-center text-sm font-medium">{qty}</div>
                  <button
                    aria-label={`increase ${item.name}`}
                    onClick={() => changeQty(item.id, +1)}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800/60 active:scale-95"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          {/* Add / Remove CTA & image */}
          <div className="flex flex-col items-end gap-3">
            <button
              onClick={() => toggleItem(item)}
              className={`px-4 py-2 rounded-xl font-medium text-sm transition-shadow shadow-sm min-w-[96px]
                ${selected ? "bg-red-500 text-white hover:bg-red-600" : "bg-green-600 text-white hover:bg-green-700"}
              `}
            >
              {selected ? "Remove" : "Add"}
            </button>

            {item.tag && <div className="text-xs text-gray-500 mt-1">{item.tag}</div>}

            {item.image && (
              <div className="w-20 h-20 rounded-xl overflow-hidden hidden sm:block mt-1">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-100 to-teal-100 dark:from-gray-900 dark:to-gray-800 px-4 sm:px-6 lg:px-10 py-8 transition-colors duration-700">
      {/* Back Button */}
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-3 py-2 mb-6 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-700 font-medium hover:bg-emerald-100 transition"
        >
          <span className="inline-block rotate-180">➔</span> Back
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative max-w-5xl mx-auto rounded-3xl overflow-hidden shadow-2xl"
      >
        {/* Main card content (above the video) */}
        <div className="relative p-6 sm:p-8 bg-white/95 dark:bg-gray-900/90 backdrop-blur-md">
          {/* Header with small video bubble + title */}
          <div className="mb-6 space-y-4 text-center">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <UtensilsCrossed className="text-green-600 w-10 h-10" />
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-100">
                Healthy Quick Order
              </h1>
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base max-w-2xl mx-auto">
              Choose a meal, pick healthy items, and we’ll handpack it fresh. Vijayawada only 🚚🌿
            </p>

            {/* intro bubble video (small, round) */}
            <div className="flex justify-center mt-3">
              <motion.div
                whileHover={{ scale: 1.03 }}
                className="relative rounded-full overflow-hidden w-36 h-36 sm:w-56 sm:h-56 ring-6 ring-green-400/30 shadow-2xl"
                aria-hidden
              >
                <video
                  src="/ordering.mp4"
                  autoPlay
                  muted
                  playsInline
                  loop
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-green-700/85 text-white text-xs px-3 py-1 rounded-full">
                  Fresh • Organic • Balanced
                </div>
              </motion.div>
            </div>
          </div>

          {/* Meal Type selection */}
          <div className="max-w-5xl mx-auto">
            {!mealType && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {[
                  { name: "breakfast", icon: <Apple className="text-orange-500" /> },
                  { name: "lunch", icon: <Salad className="text-green-500" /> },
                  { name: "dinner", icon: <Dumbbell className="text-purple-500" /> },
                ].map(({ name, icon }) => (
                  <motion.button
                    key={name}
                    onClick={() => setMealType(name)}
                    whileHover={{ y: -4 }}
                    className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-white/90 dark:bg-gray-800/70 border border-green-100/30 shadow-sm"
                  >
                    <div className="text-2xl">{icon}</div>
                    <div className="text-lg font-semibold capitalize text-gray-900 dark:text-white">{name}</div>
                    <div className="text-xs text-gray-500">Healthy selections</div>
                  </motion.button>
                ))}
              </div>
            )}

            {/* Menu + Items */}
            {mealType && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <button onClick={() => setMealType(null)} className="text-sm text-green-700 underline">
                      ← Back
                    </button>
                    <h2 className="text-xl sm:text-2xl font-semibold mt-2 text-gray-900 dark:text-white capitalize">
                      {mealType} Menu <Leaf className="inline-block ml-2 text-green-500" />
                    </h2>
                  </div>

                  {/* order summary chip */}
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Items selected</div>
                    <div className="mt-1 font-bold text-lg text-green-700">
                      {Object.keys(selectedMap).length} • {formatINR(totalPrice)}
                    </div>
                  </div>
                </div>

                {/* Items grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mealData[mealType].map((it) => (
                    <FoodCard key={it.id} item={it} />
                  ))}
                </div>

                {/* Delivery + Payment */}
                {Object.keys(selectedMap).length > 0 && (
                  <div className="mt-4 p-4 sm:p-6 rounded-2xl border border-green-100/30 bg-white/95 dark:bg-gray-900/90 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Delivery Details
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex items-center gap-2">
                        <Home className="text-green-500" />
                        <input
                          type="text"
                          value={doorNo}
                          onChange={(e) => setDoorNo(e.target.value)}
                          placeholder="Door No."
                          className="w-full border rounded-lg p-3 bg-white/60 dark:bg-gray-900/60 text-sm"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <Landmark className="text-indigo-500" />
                        <input
                          type="text"
                          value={landmark}
                          onChange={(e) => setLandmark(e.target.value)}
                          placeholder="Landmark"
                          className="w-full border rounded-lg p-3 bg-white/60 dark:bg-gray-900/60 text-sm"
                        />
                      </div>
                    </div>

                    <div className="flex items-start gap-2 mt-3">
                      <MapPin className="text-red-500 mt-2" />
                      <textarea
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Full Address (Vijayawada only)"
                        className="w-full border rounded-lg p-3 bg-white/60 dark:bg-gray-900/60 text-sm"
                        rows={3}
                      />
                    </div>

                    {/* Phone (Indian validation) */}
                    <div className="flex items-center gap-2 mt-3">
                      <Phone className="text-blue-500" />
                      <div className="w-full">
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "");
                            if (val.length <= 10) setPhone(val);
                          }}
                          placeholder="Enter 10-digit Indian phone number"
                          className={`w-full border rounded-lg p-3 bg-white/60 dark:bg-gray-900/60 text-sm transition focus:ring-2 ${
                            phone.length === 10 && /^[6-9]\d{9}$/.test(phone)
                              ? "border-green-400 focus:ring-green-400"
                              : "border-red-300 focus:ring-red-400"
                          }`}
                        />

                        {phone && (
                          <p
                            className={`text-xs mt-1 ${
                              /^[6-9]\d{9}$/.test(phone) ? "text-green-600" : "text-red-500"
                            }`}
                          >
                            {/^[6-9]\d{9}$/.test(phone)
                              ? "✅ Valid Indian mobile number"
                              : "⚠️ Must be 10 digits and start with 6–9"}
                          </p>
                        )}
                      </div>
                    </div>

                    <h4 className="mt-4 mb-2 font-semibold text-gray-900 dark:text-white">Payment</h4>
                    <div className="flex gap-4 items-center text-sm">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="pm"
                          value="cod"
                          checked={payment === "cod"}
                          onChange={() => setPayment("cod")}
                        />
                        <span className="ml-1">Cash on Delivery</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="pm"
                          value="online"
                          checked={payment === "online"}
                          onChange={() => setPayment("online")}
                        />
                        <span className="ml-1">Online Payment</span>
                      </label>
                    </div>

                    {/* payment video preview overlay */}
                    {showPaymentVideo && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div
                          className="absolute inset-0 bg-black/60"
                          onClick={() => setShowPaymentVideo(false)}
                        />
                        <div className="relative z-10 w-full max-w-lg rounded-xl overflow-hidden shadow-2xl">
                          <video src="/cashflow2.mp4" autoPlay muted loop className="w-full h-auto object-cover" />
                          <div className="p-4 bg-white text-center">
                            <p className="text-orange-700 font-semibold">Processing Payment...</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* place order area — mobile-friendly full-width button */}
                    <div className="mt-4 flex flex-col sm:flex-row items-center sm:justify-between gap-3">
                      <div className="text-sm text-gray-700">
                        <div>Subtotal: <span className="font-bold">{formatINR(totalPrice)}</span></div>

                        <div className="mt-1 flex items-center gap-2">
                          <span>Delivery:</span>
                          {deliveryCharge === 0 ? (
                            <span className="flex items-center text-yellow-600 font-semibold relative">
                              <span className="absolute inset-0 rounded-full bg-yellow-300/20 blur-md animate-pulse" />
                              <span className="relative z-10">Free Delivery</span>
                            </span>
                          ) : (
                            <span className="text-green-700 font-medium">₹{deliveryCharge}</span>
                          )}
                        </div>

                        <div className="mt-2 text-xs text-gray-500">
                          {deliveryCharge === 0
                            ? "Premium member: Enjoy free delivery on all orders!"
                            : "Delivery fee may vary depending on your area."}
                        </div>
                      </div>

                      <div className="w-full sm:w-auto">
                        <motion.button
                          onClick={handlePlaceOrderClick}
                          disabled={busy}
                          initial={{ scale: 1 }}
                          animate={showWorkerVideo ? { scale: 1.05 } : { scale: 1 }}
                          transition={{ duration: 0.3 }}
                          className={`relative w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-3 rounded-2xl font-semibold text-white text-base shadow-md overflow-hidden transition-all ${
                            busy ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
                          }`}
                        >
                          {/* video overlay when worker plays */}
                          {showWorkerVideo && (
                            <motion.div
                              className="absolute inset-0 rounded-2xl bg-green-400/25 blur-xl"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: [0.3, 0.6, 0.3] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            />
                          )}

                          {/* enlarged video inside button (small preview for fun on larger screens) */}
                          {showWorkerVideo && (
                            <motion.video
                              key="cartBtn"
                              src="/worker.mp4"
                              autoPlay
                              muted
                              loop
                              playsInline
                              className="absolute inset-0 w-full h-full object-cover rounded-2xl hidden sm:block"
                              style={{
                                objectFit: "cover",
                                filter: "brightness(1.05) contrast(1.05)",
                              }}
                              initial={{ scale: 1.15, opacity: 0 }}
                              animate={{ scale: 1.25, opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.5 }}
                            />
                          )}

                          {!showWorkerVideo && (
                            <span className="relative z-10 flex items-center gap-2">
                              {loading ? (
                                <>
                                  <Loader2 className="w-5 h-5 animate-spin" /> Placing...
                                </>
                              ) : (
                                <>
                                  <CreditCard className="w-5 h-5" />
                                  {`Place Order • ${formatINR(totalPrice + deliveryCharge)}`}
                                </>
                              )}
                            </span>
                          )}
                        </motion.button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Worker video overlay (centered) */}
      {showWorkerVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative z-10 w-full max-w-md rounded-xl overflow-hidden shadow-2xl">
            <video src="/worker.mp4" autoPlay muted loop className="w-full h-auto object-cover" />
            <div className="p-4 bg-white text-center">
              <p className="text-green-700 font-semibold">Packing your order — hang tight!</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
