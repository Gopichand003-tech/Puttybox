import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Package, Loader2,ArrowLeft } from "lucide-react";
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

  // ✅ Cached plan data (for instant switching)
  const [cache, setCache] = useState({});

  // ✅ Ensure user exists before fetching
  const isUserReady = !!user?.id;

  // ✅ Subscription info
  const [subscription, setSubscription] = useState({
    totalBoxes: 0,
    deliveredBoxes: 0,
    remainingBoxes: 0,
  });

  // ✅ Derived values (memoized for performance)
  const { total, delivered, remainingBoxes, progressPercent } = useMemo(() => {
    const total = Number(subscription?.totalBoxes) || 0;
    const delivered = Number(subscription?.deliveredBoxes) || 0;
    const remainingBoxes = Math.max(total - delivered, 0);
    const progressPercent =
      total > 0 ? Math.min((delivered / total) * 100, 100) : 0;
    return { total, delivered, remainingBoxes, progressPercent };
  }, [subscription]);

  //loader
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
      // ⚡ Instant cache return
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

  if (isUserReady) {
    setLoading(true);
    fetchPremiumStatus(); // run immediately
    fetchMealPlan(); // parallel, non-blocking
  }

  return () => (mounted = false);
}, [normalizedType, isUserReady]);


  /* 🦋 Skeleton shimmer loader */
  const renderSkeleton = () => (
    <div className="animate-pulse space-y-6">
      <div className="h-6 bg-emerald-100 rounded w-1/3"></div>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-44 bg-gray-100 rounded-xl shadow-sm"></div>
        ))}
      </div>
    </div>
  );

  /* 🥗 Select a meal */
  const mealCategories = plan ? Object.keys(plan.meals || {}) : [];

  const handleSelect = (category, item) => {
    if (remainingBoxes <= 0) {
      toast.error("All your boxes are already delivered!");
      return;
    }
    setSelected((prev) => ({ ...prev, [category]: item }));
  };

  /* ✅ Submission state */
  const canSend =
    mealCategories.length > 0 &&
    Object.keys(selected).length === mealCategories.length &&
    remainingBoxes > 0;

  /* 📦 Save selected meals */
  const handleSave = async () => {
    if (!canSend) {
      toast.error("Please select one meal per category before scheduling.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        userId: user.id,
        planType: normalizedType,
        selectedMeals: selected,
        proteinTarget:
          normalizedType === "protein" ? proteinTarget : undefined,
      };

      const res = await axios.post("/api/mealorder", payload, {
        withCredentials: true, // ✅ ensures cookie is attached
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

 if (loading) return (
  <div className="flex flex-col items-center justify-center h-screen text-gray-600">
    <Loader2 className="animate-spin h-8 w-8 text-emerald-500 mb-3" />
    <p>Loading your meal plan...</p>
  </div>
);

  if (error) {
    return <p className="text-red-600 text-center mt-10">{error}</p>;
  }

  /* 🌿 Main UI */
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white py-12 px-4">
      <Header isPremium />


      <main className="max-w-6xl mx-auto mt-8 transition-opacity duration-500">
        {/* ✅ Delivery Progress */}
        <div className="bg-white p-5 rounded-xl shadow-md border border-emerald-100 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Package className="text-emerald-600" />
            <h2 className="font-semibold text-emerald-800">
              Delivery Progress
            </h2>
          </div>
          <div className="w-full bg-emerald-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-2 transition-all duration-700"
              style={{ width: `${progressPercent}%` }}
            ></div>
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

        {/* ✅ Protein Target Slider */}
        {normalizedType === "protein" && (
          <div className="bg-white p-4 rounded-xl shadow mb-6">
            <label className="font-medium text-emerald-700">
              Protein Target: {proteinTarget}g
            </label>
            <input
              type="range"
              min="20"
              max="120"
              value={proteinTarget}
              onChange={(e) => setProteinTarget(Number(e.target.value))}
              className="w-64 accent-emerald-600 ml-4"
            />
          </div>
        )}

        {/* ✅ Meal Category Display */}
        {mealCategories.map((category) => (
          <section key={category} className="mb-10">
            <h2 className="text-2xl font-semibold text-emerald-700 mb-4 border-l-4 border-emerald-500 pl-3 capitalize">
              {category.replace(/([A-Z])/g, " $1").trim()}
            </h2>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {plan.meals[category].map((item) => {
                const isSelected = selected[category]?.name === item.name;
                return (
                  <motion.div
                    key={item.name}
                    whileHover={{ scale: 1.03 }}
                    onClick={() => handleSelect(category, item)}
                    className={`relative rounded-xl overflow-hidden border shadow-sm bg-white cursor-pointer transition-all duration-300 ${
                      isSelected
                        ? "ring-2 ring-emerald-400 border-emerald-300"
                        : "hover:border-emerald-200"
                    }`}
                  >
                  <video
  src={item.video}
  className="w-full h-44 object-cover"
  muted
  loop
  playsInline
  preload="none"
  loading="lazy"
  onMouseEnter={(e) => e.target.play()}
  onMouseLeave={(e) => e.target.pause()}
/>


                    <div className="p-4">
                      <h3 className="font-semibold text-gray-800">
                        {item.name}
                      </h3>
                      <div className="text-sm text-emerald-600 mt-1">
                        {item.protein && `${item.protein} Protein `}
                        {item.carbs && `${item.carbs} Carbs `}
                        {item.fat && `${item.fat} Fat`}
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="absolute top-3 right-3 text-emerald-500" />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </section>
        ))}

        {/* ✅ Summary Section */}
        <div className="bg-emerald-50 p-6 rounded-xl shadow-inner mb-8">
          <h3 className="text-xl font-bold text-emerald-800 mb-2">
            Your Selection
          </h3>
          {Object.keys(selected).length === 0 ? (
            <p className="text-gray-600">No meals selected yet.</p>
          ) : (
            <ul className="divide-y divide-emerald-100">
              {Object.entries(selected).map(([cat, item]) => (
                <li key={cat} className="py-2 flex justify-between">
                  <span className="capitalize text-gray-700">{cat}</span>
                  <span className="text-emerald-700 font-medium">
                    {item.name}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 text-sm text-gray-600">
            Boxes remaining:{" "}
            <span className="font-semibold text-emerald-700">
              {remainingBoxes}
            </span>
          </p>
        </div>

        {/* ✅ Submit Button */}
        <div className="flex justify-center">
          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={handleSave}
            disabled={!canSend || saving}
            className={`px-8 py-3 rounded-xl text-white font-semibold shadow-lg ${
              canSend
                ? "bg-emerald-500 hover:bg-emerald-700"
                : "bg-emerald-300 cursor-not-allowed"
            }`}
          >
            {remainingBoxes <= 0
              ? "All Boxes Delivered"
              : saving
              ? "Scheduling..."
              : "Schedule My Next Meal Box"}
          </motion.button>
        </div>
      </main>
    </div>
  );
}
