import React, { useEffect, useState, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Package, Loader2, Play } from "lucide-react";
import axios from "axios";
import Header from "../components/Header";
import { toast } from "sonner";
import { useAuth } from "../context/Authcontext";

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

  const [cache, setCache] = useState({});
  const [subscription, setSubscription] = useState({
    totalBoxes: 0,
    deliveredBoxes: 0,
    remainingBoxes: 0,
  });

  // 🔍 Detect touch devices
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    setIsTouch(
      "ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        navigator.msMaxTouchPoints > 0
    );
  }, []);

  // 📊 Derived subscription values
  const { total, delivered, remainingBoxes, progressPercent } = useMemo(() => {
    const total = Number(subscription.totalBoxes || 0);
    const delivered = Number(subscription.deliveredBoxes || 0);
    return {
      total,
      delivered,
      remainingBoxes: Math.max(total - delivered, 0),
      progressPercent: total ? Math.min((delivered / total) * 100, 100) : 0,
    };
  }, [subscription]);

  // 📦 Fetch plan + subscription
  useEffect(() => {
    let mounted = true;

    const fetchPremium = async () => {
      try {
        const res = await axios.get("/api/auth/checkPremiumStatus");
        if (mounted && res.data) {
          setSubscription(res.data);
        }
      } catch {}
    };

    const fetchPlan = async () => {
      try {
        if (cache[normalizedType]) {
          setPlan(cache[normalizedType]);
          setLoading(false);
          return;
        }
        const res = await axios.get(`/api/planorder/${normalizedType}`);
        if (mounted && res.data) {
          setPlan(res.data);
          setCache((p) => ({ ...p, [normalizedType]: res.data }));
        }
      } catch {
        setError("Failed to load meal plan");
      } finally {
        mounted && setLoading(false);
      }
    };

    if (user?.id) {
      fetchPremium();
    }
    fetchPlan();

    return () => (mounted = false);
  }, [normalizedType, user?.id]);

  // 🥗 Meal select
  const mealCategories = plan ? Object.keys(plan.meals || {}) : [];
  const handleSelect = (cat, item) => {
    if (remainingBoxes <= 0) return toast.error("All boxes delivered");
    setSelected((p) => ({ ...p, [cat]: item }));
  };

  const canSend =
    mealCategories.length &&
    Object.keys(selected).length === mealCategories.length &&
    remainingBoxes > 0;

  // 🚀 Save
  const handleSave = async () => {
    if (!canSend) return toast.error("Select all meals");
    setSaving(true);
    try {
      await axios.post("/api/mealorder", {
        userId: user?.id || user?._id,
        planType: normalizedType,
        selectedMeals: selected,
        proteinTarget: normalizedType === "protein" ? proteinTarget : undefined,
      });
      toast.success("Meal scheduled successfully");
      setSelected({});
      setSubscription((p) => ({
        ...p,
        deliveredBoxes: p.deliveredBoxes + 1,
      }));
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="h-screen flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-emerald-500" />
        <p>Loading meal plan...</p>
      </div>
    );

  if (error) return <p className="text-center text-red-500">{error}</p>;

  // 🎥 Optimized Video Card
  function VideoCard({ src, poster }) {
    const videoRef = useRef(null);
    const wrapperRef = useRef(null);
    const [playing, setPlaying] = useState(false);

    // Pause when offscreen
    useEffect(() => {
      const video = videoRef.current;
      if (!video || !wrapperRef.current) return;

      const obs = new IntersectionObserver(
        ([e]) => {
          if (!e.isIntersecting && !video.paused) {
            video.pause();
            setPlaying(false);
          }
        },
        { threshold: 0.4 }
      );
      obs.observe(wrapperRef.current);
      return () => obs.disconnect();
    }, []);

    const pauseOthers = () =>
      document.querySelectorAll("video").forEach((v) => {
        if (v !== videoRef.current) v.pause();
      });

    const play = () => {
      pauseOthers();
      videoRef.current?.play().catch(() => {});
      setPlaying(true);
    };

    const pause = () => {
      videoRef.current?.pause();
      setPlaying(false);
    };

    return (
      <div
        ref={wrapperRef}
        className="relative h-40 sm:h-52 md:h-56 lg:h-64 overflow-hidden bg-gray-100"
        onMouseEnter={!isTouch ? play : undefined}
        onMouseLeave={!isTouch ? pause : undefined}
        onClick={isTouch ? () => (playing ? pause() : play()) : undefined}
      >
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          muted
          preload="metadata"
          playsInline
          loop={!isTouch}
          disablePictureInPicture
          className="w-full h-full object-cover"
        />
        {isTouch && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
              <Play className="text-emerald-600" />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white px-4 py-8">
      <Header isPremium />

      <main className="max-w-6xl mx-auto">
        {/* Progress */}
        <div className="bg-white p-5 rounded-xl shadow mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Package className="text-emerald-600" />
            <h2 className="font-semibold">Delivery Progress</h2>
          </div>
          <div className="h-2 bg-emerald-100 rounded">
            <div
              className="h-2 bg-emerald-500 rounded"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-3 gap-3">
  <p className="text-sm text-gray-600">
    {delivered}/{total} delivered •{" "}
    <span className="text-emerald-600 font-medium">
      {remainingBoxes} remaining
    </span>
  </p>

  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={() => navigate("/order-history")}
   className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg shadow hover:bg-emerald-700 transition"
>
    <Package className="w-5 h-5" />
  <span>Order History</span>
  </motion.button>
</div>

        </div>

        {/* Protein slider */}
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
              onChange={(e) => setProteinTarget(+e.target.value)}
              className="w-full accent-emerald-600"
            />
          </div>
        )}

        {/* Meals */}
        {mealCategories.map((cat) => (
          <section key={cat} className="mb-10">
            <h3 className="text-xl font-semibold mb-4 capitalize">{cat}</h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {plan.meals[cat].map((item) => {
                const active = selected[cat]?.name === item.name;
                return (
                  <motion.div
                    key={item.name}
                    whileHover={{ scale: 1.03 }}
                    onClick={() => handleSelect(cat, item)}
                    className={`rounded-xl overflow-hidden border bg-white cursor-pointer ${
                      active
                        ? "ring-2 ring-emerald-400"
                        : "hover:border-emerald-200"
                    }`}
                  >
                    <VideoCard src={item.video} poster={item.image} />
                    <div className="p-4">
                      <h4 className="font-semibold">{item.name}</h4>
                      <p className="text-sm text-emerald-600">
                        {item.protein && `${item.protein} Protein `}
                        {item.carbs && `${item.carbs} Carbs `}
                        {item.fat && `${item.fat} Fat`}
                      </p>
                    </div>
                    {active && (
                      <CheckCircle2 className="absolute top-3 right-3 text-emerald-500 bg-white rounded-full" />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </section>
        ))}

        {/* Selection summary */}
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
    Boxes remaining:
    <span className="font-semibold text-emerald-700">
      {remainingBoxes}
    </span>
  </p>
</div>


        {/* Submit */}
        <div className="flex justify-center">
          <motion.button
            whileHover={{ scale: 1.02 }}
            disabled={!canSend || saving}
            onClick={handleSave}
            className={`px-8 py-3 rounded-xl text-white font-semibold shadow ${
              canSend
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-emerald-300 cursor-not-allowed"
            }`}
          >
            {saving ? "Scheduling..." : "Schedule My Next Meal Box"}
          </motion.button>
        </div>
      </main>
    </div>
  );
}
