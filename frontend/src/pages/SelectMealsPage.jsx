// src/pages/SelectMealsPage.jsx
import React, { useEffect, useState, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Package, Loader2, ArrowLeft, Play } from "lucide-react";
import axios from "axios";
import Header from "../components/Header";
import { toast } from "sonner";
import { useAuth } from "../context/Authcontext";
import { useNavigate } from "react-router-dom";

// ✅ Ensure all requests include auth cookies
axios.defaults.withCredentials = true;

export default function SelectMealsPage() {
  const { planType } = useParams();
  const normalizedType = (planType || "").replace(/-/g, "").toLowerCase();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState(null);
  const [selected, setSelected] = useState({});
  const [proteinTarget, setProteinTarget] = useState(50);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Cached plan data (for instant switching)
  const [cache, setCache] = useState({});

  // Subscription info
  const [subscription, setSubscription] = useState({
    totalBoxes: 0,
    deliveredBoxes: 0,
    remainingBoxes: 0,
  });

  // Detect touch devices to adjust video behavior
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    const hasTouch =
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      navigator.msMaxTouchPoints > 0;
    setIsTouch(Boolean(hasTouch));
  }, []);

  // Derived values (memoized)
  const { total, delivered, remainingBoxes, progressPercent } = useMemo(() => {
    const total = Number(subscription?.totalBoxes) || 0;
    const delivered = Number(subscription?.deliveredBoxes) || 0;
    const remainingBoxes = Math.max(total - delivered, 0);
    const progressPercent = total > 0 ? Math.min((delivered / total) * 100, 100) : 0;
    return { total, delivered, remainingBoxes, progressPercent };
  }, [subscription]);

  // loader & data fetch
  useEffect(() => {
    let mounted = true;

    const fetchPremiumStatus = async () => {
      try {
        const res = await axios.get(`/api/auth/checkPremiumStatus`);
        if (mounted && res.data) {
          const d = res.data;
          setSubscription({
            totalBoxes: d.totalBoxes || 0,
            deliveredBoxes: d.deliveredBoxes || 0,
            remainingBoxes: d.remainingBoxes || 0,
          });
        }
      } catch (err) {
        console.error("❌ Premium status fetch failed:", err.message);
      }
    };

    const fetchMealPlan = async () => {
      try {
        // Instant cache return
        if (cache[normalizedType]) {
          setPlan(cache[normalizedType]);
          setLoading(false);
          return;
        }

        const res = await axios.get(`/api/planorder/${normalizedType}`);
        if (mounted && res.data) {
          setPlan(res.data);
          setCache((prev) => ({ ...prev, [normalizedType]: res.data }));
        }
      } catch (err) {
        console.error("❌ Meal plan fetch failed:", err.message);
        if (mounted) setError("Unable to load meal plan data.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    // Only fetch when user is present (to ensure cookies/auth loaded)
    if (user?.id) {
      setLoading(true);
      fetchPremiumStatus(); // run immediately
      fetchMealPlan(); // parallel, non-blocking
    } else {
      // if user not ready, we still attempt to fetch plan but keep it guarded
      fetchMealPlan();
    }

    return () => (mounted = false);
  }, [normalizedType, user?.id]); // eslint-disable-line

  /* Skeleton shimmer loader */
  const renderSkeleton = () => (
    <div className="animate-pulse space-y-6 px-4">
      <div className="h-6 bg-emerald-100 rounded w-1/3"></div>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-44 bg-gray-100 rounded-xl shadow-sm"></div>
        ))}
      </div>
    </div>
  );

  /* Select meal handler */
  const mealCategories = plan ? Object.keys(plan.meals || {}) : [];

  const handleSelect = (category, item) => {
    if (remainingBoxes <= 0) {
      toast.error("All your boxes are already delivered!");
      return;
    }
    setSelected((prev) => ({ ...prev, [category]: item }));
  };

  /* Submission state */
  const canSend =
    mealCategories.length > 0 &&
    Object.keys(selected).length === mealCategories.length &&
    remainingBoxes > 0;

  /* Save selected meals */
  const handleSave = async () => {
    if (!canSend) {
      toast.error("Please select one meal per category before scheduling.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        userId: user?.id || user?._id,
        planType: normalizedType,
        selectedMeals: selected,
        proteinTarget: normalizedType === "protein" ? proteinTarget : undefined,
      };

      const res = await axios.post("/api/mealorder", payload, {
        withCredentials: true,
      });

      if (res.status === 200 || res.status === 201) {
        toast.success("✅ Meal box customization sent successfully!");
        setSelected({});
        setSubscription((prev) => ({
          ...prev,
          deliveredBoxes: Math.min(prev.deliveredBoxes + 1, prev.totalBoxes),
        }));
      } else {
        toast.error("Something went wrong while scheduling your box.");
      }
    } catch (err) {
      console.error("❌ Save error:", err);
      toast.error("Failed to send meal customization.");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-screen text-gray-600">
        <Loader2 className="animate-spin h-8 w-8 text-emerald-500 mb-3" />
        <p>Loading your meal plan...</p>
      </div>
    );

  if (error) {
    return <p className="text-red-600 text-center mt-10">{error}</p>;
  }

  /* ---------------------------
     VideoCard component (responsive + touch-friendly)
     --------------------------- */
  function VideoCard({ src, poster, alt }) {
    const ref = useRef(null);
    const [playing, setPlaying] = useState(false);
    const [loaded, setLoaded] = useState(false);

    // play on hover for pointer devices
    const handleMouseEnter = () => {
      if (isTouch) return;
      const v = ref.current;
      if (v && v.paused) {
        v.play().catch(() => {});
        setPlaying(true);
      }
    };
    const handleMouseLeave = () => {
      if (isTouch) return;
      const v = ref.current;
      if (v && !v.paused) {
        v.pause();
        setPlaying(false);
      }
    };

    // on mobile, toggle play/pause on click/tap
    const handleTap = () => {
      const v = ref.current;
      if (!v) return;
      if (v.paused) {
        v.play().catch(() => {});
        setPlaying(true);
      } else {
        v.pause();
        setPlaying(false);
      }
    };

    // pause when unmounting
    useEffect(() => {
      return () => {
        const v = ref.current;
        if (v && !v.paused) v.pause();
      };
    }, []);

    return (
      <div
        className="relative w-full h-44 sm:h-52 md:h-56 lg:h-64 overflow-hidden bg-gray-100 rounded-md"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <video
          ref={ref}
          src={src}
          poster={poster}
          preload="none"
          muted
          playsInline
          loop
          className="w-full h-full object-cover"
          aria-label={alt || "Meal preview video"}
          onLoadedData={() => setLoaded(true)}
          onClick={() => {
            if (isTouch) handleTap();
          }}
        />
        {/* play overlay for touch devices (and until video loads) */}
        {isTouch && (
          <button
            onClick={() => {
              const v = ref.current;
              if (!v) return;
              if (v.paused) {
                v.play().catch(() => {});
                setPlaying(true);
              } else {
                v.pause();
                setPlaying(false);
              }
            }}
            aria-label={playing ? "Pause video" : "Play video"}
            className="absolute inset-0 flex items-center justify-center bg-black/20"
            type="button"
          >
            <div
              className={`flex items-center justify-center w-12 h-12 rounded-full bg-white/90 shadow transition-transform ${
                playing ? "scale-90 opacity-60" : "scale-100"
              }`}
            >
              <Play className="w-5 h-5 text-emerald-700" />
            </div>
          </button>
        )}

        {/* small loading indicator */}
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="animate-spin w-6 h-6 text-emerald-500" />
          </div>
        )}
      </div>
    );
  }

  /* Utility: prettify category title */
  const prettyCategory = (s) => s.replace(/([A-Z])/g, " $1").trim();

  /* Main UI */
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white py-8 px-4">
      <Header isPremium />

      <main className="max-w-6xl mx-auto mt-8 transition-opacity duration-500">
        {/* Delivery Progress */}
        <div className="bg-white p-5 rounded-xl shadow-md border border-emerald-100 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Package className="text-emerald-600" />
            <h2 className="font-semibold text-emerald-800">Delivery Progress</h2>
          </div>

          <div className="w-full bg-emerald-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-2 transition-all duration-700"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-2">
            <p className="text-sm text-gray-600">
              {delivered}/{total} boxes delivered •{" "}
              <span className="font-medium text-emerald-700">{remainingBoxes} remaining</span>
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate("/order-history")}
              className="bg-emerald-600 text-white font-medium px-4 py-2 rounded-lg shadow hover:bg-emerald-700 transition-all duration-200 mt-3 sm:mt-0"
            >
              📦 View Order History
            </motion.button>
          </div>
        </div>

        {/* Protein slider */}
        {normalizedType === "protein" && (
          <div className="bg-white p-4 rounded-xl shadow mb-6 flex items-center gap-4 flex-wrap">
            <label className="font-medium text-emerald-700">Protein Target: {proteinTarget}g</label>
            <input
              type="range"
              min="20"
              max="120"
              value={proteinTarget}
              onChange={(e) => setProteinTarget(Number(e.target.value))}
              className="w-full max-w-lg accent-emerald-600"
            />
          </div>
        )}

        {/* Meal categories */}
        {mealCategories.map((category) => (
          <section key={category} className="mb-10">
            <h2 className="text-2xl font-semibold text-emerald-700 mb-4 border-l-4 border-emerald-500 pl-3 capitalize">
              {prettyCategory(category)}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {plan.meals[category].map((item) => {
                const isSelected = selected[category]?.name === item.name;
                return (
                  <motion.div
                    key={item.name}
                    whileHover={{ scale: 1.03 }}
                    onClick={() => handleSelect(category, item)}
                    className={`relative rounded-xl overflow-hidden border shadow-sm bg-white cursor-pointer transition-all duration-300 ${
                      isSelected ? "ring-2 ring-emerald-400 border-emerald-300" : "hover:border-emerald-200"
                    }`}
                  >
                    {/* Responsive VideoCard */}
                    <VideoCard
                      src={item.video}
                      poster={item.poster || item.image || ""}
                      alt={item.name}
                    />

                    <div className="p-4">
                      <h3 className="font-semibold text-gray-800">{item.name}</h3>
                      <div className="text-sm text-emerald-600 mt-1">
                        {item.protein && `${item.protein} Protein `}
                        {item.carbs && `${item.carbs} Carbs `}
                        {item.fat && `${item.fat} Fat`}
                      </div>
                    </div>

                    {isSelected && (
                      <CheckCircle2 className="absolute top-3 right-3 text-emerald-500 bg-white/80 rounded-full p-1" />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </section>
        ))}

        {/* Selection summary */}
        <div className="bg-emerald-50 p-6 rounded-xl shadow-inner mb-8">
          <h3 className="text-xl font-bold text-emerald-800 mb-2">Your Selection</h3>
          {Object.keys(selected).length === 0 ? (
            <p className="text-gray-600">No meals selected yet.</p>
          ) : (
            <ul className="divide-y divide-emerald-100">
              {Object.entries(selected).map(([cat, item]) => (
                <li key={cat} className="py-2 flex justify-between">
                  <span className="capitalize text-gray-700">{cat}</span>
                  <span className="text-emerald-700 font-medium">{item.name}</span>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 text-sm text-gray-600">
            Boxes remaining:{" "}
            <span className="font-semibold text-emerald-700">{remainingBoxes}</span>
          </p>
        </div>

        {/* Submit */}
        <div className="flex justify-center mb-16">
          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={handleSave}
            disabled={!canSend || saving}
            className={`px-8 py-3 rounded-xl text-white font-semibold shadow-lg ${
              canSend ? "bg-emerald-500 hover:bg-emerald-700" : "bg-emerald-300 cursor-not-allowed"
            }`}
            aria-disabled={!canSend || saving}
          >
            {remainingBoxes <= 0 ? "All Boxes Delivered" : saving ? "Scheduling..." : "Schedule My Next Meal Box"}
          </motion.button>
        </div>
      </main>
    </div>
  );
}
