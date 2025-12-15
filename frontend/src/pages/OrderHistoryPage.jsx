// src/pages/OrderHistoryPage.jsx
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
  XCircle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import Header from "../components/Header";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

axios.defaults.withCredentials = true;

/* ================= Reorder Modal ================= */
function Modal({
  open,
  onClose,
  onConfirm,
  loading,
  title,
  description,
  confirmText,
  icon,
}) {
  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full"
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            {icon}
            <h3 className="text-lg font-bold text-gray-800">
              {title}
            </h3>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 mb-6">
            {description}
          </p>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              onClick={onConfirm}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-2 disabled:opacity-70"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {confirmText}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

const getStatusStyles = (status) => {
  switch (status) {
    case "scheduled":
      return "bg-blue-100 text-blue-700";
    case "in-progress":
      return "bg-yellow-100 text-yellow-700";
    case "delivered":
      return "bg-green-100 text-green-700";
    case "cancelled":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};


/* ================= Cancel Modal ================= */
function CancelConfirmModal({ open, onClose, onConfirm, loading }) {
  if (!open) return null;


  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full"
        >
          <div className="flex items-center gap-3 mb-4">
            <XCircle className="text-red-500 w-6 h-6" />
            <h3 className="text-lg font-bold text-gray-800">
              Cancel Order?
            </h3>
          </div>

          <p className="text-sm text-gray-600 mb-6">
            Are you sure you want to cancel this order?
            This action cannot be undone.
          </p>

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50"
            >
              Keep Order
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 flex items-center gap-2 disabled:opacity-70"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Yes, Cancel
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ================= Main Page ================= */
export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active");
  const [cancelOrderId, setCancelOrderId] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
   const [reorderOrderId, setReorderOrderId] = useState(null);
   const [actionLoading, setActionLoading] = useState(false);


  const navigate = useNavigate();

  /* ================= Fetch Orders ================= */
  const fetchOrders = useCallback(async () => {
    try {
      const res = await axios.get("/api/mealorder/user");
      setOrders(res.data.orders || []);
    } catch {
      toast.error("Failed to load order history");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  /* ================= Actions ================= */
 async function confirmReorder() {
    if (!reorderOrderId) return;
    setActionLoading(true);

    try {
      await axios.post(`/api/mealorder/reorder/${reorderOrderId}`);
      toast.success("Meal box reordered");
      setReorderOrderId(null);
      fetchOrders();
    } catch {
      toast.error("Reorder failed");
    } finally {
      setActionLoading(false);
    }
  }

  async function confirmCancel() {
  if (!cancelOrderId) return;

  const toastId = toast.loading("Cancelling order...");

  try {
    await axios.put(
      `/api/mealorder/${cancelOrderId}/cancel`,
      {},
      { withCredentials: true }
    );

    toast.success("Order cancelled successfully", { id: toastId });
    setCancelOrderId(null);
    fetchOrders(); // refresh UI
  } catch (err) {
    toast.error(
      err.response?.data?.message || "Cancel failed",
      { id: toastId }
    );
  }
}

function handleReorder(orderId) {
  setReorderOrderId(orderId);
}



  /* ================= Filter ================= */
  const filteredOrders = orders.filter((o) => {
    if (activeTab === "active")
      return o.status === "scheduled" || o.status === "in-progress";
    if (activeTab === "delivered") return o.status === "delivered";
    if (activeTab === "cancelled") return o.status === "cancelled";
    return false;
  });

  /* ================= UI Helpers ================= */
  const planColors = {
    protein: { icon: <Dumbbell className="w-5 h-5 text-red-600" />, text: "text-red-700" },
    vegan: { icon: <Leaf className="w-5 h-5 text-green-600" />, text: "text-green-700" },
    balanced: { icon: <Flame className="w-5 h-5 text-orange-600" />, text: "text-orange-700" },
    default: { icon: <Package className="w-5 h-5 text-emerald-600" />, text: "text-emerald-700" },
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8 text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white px-4 py-8">
      <Header />

      <div className="max-w-6xl mx-auto mt-14 mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-emerald-700 bg-emerald-100 px-4 py-2 rounded-lg"
        >
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      <main className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-extrabold text-center text-emerald-800 mb-6">
          Order History
        </h1>

        {/* Tabs */}
        <div className="flex justify-center gap-2 mb-8 flex-wrap">
          {[
            { id: "active", label: "Active", icon: <Clock size={16} /> },
            { id: "delivered", label: "Delivered", icon: <CheckCircle2 size={16} /> },
            { id: "cancelled", label: "Cancelled", icon: <XCircle size={16} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition ${
                activeTab === tab.id
                  ? "bg-emerald-600 text-white"
                  : "bg-white border text-gray-600"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {filteredOrders.length === 0 ? (
          <p className="text-center text-gray-500 mt-20">
            No {activeTab} orders
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrders.map((order) => {
              const color = planColors[order.planType] || planColors.default;
              const canCancel =
                order.status !== "delivered" && order.status !== "cancelled";

              return (
                <div
                  key={order._id}
                  className="bg-white rounded-2xl shadow border overflow-hidden"
                >
                  <div className="p-5">
                    <div className="flex justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {color.icon}
                        <h3 className={`font-bold capitalize ${color.text}`}>
                          {order.planType} Plan
                        </h3>
                      </div>
                     <span
  className={`text-xs font-semibold px-2 py-1 rounded capitalize ${getStatusStyles(
    order.status
  )}`}
>
  {order.status}
</span>

                    </div>

                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <Calendar size={14} />
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>

                    <ul className="mt-3 text-sm text-gray-700 space-y-1 max-h-24 overflow-y-auto">
                      {Object.values(order.selected || {}).map((m) => (
                        <li key={m.name}>🍽 {m.name}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex gap-2 p-4 bg-emerald-50">
                    <button
                      onClick={() => handleReorder(order._id)}
                      className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-sm"
                    >
                      <RefreshCw size={14} className="inline mr-1" />
                      Reorder
                    </button>

                    <button
                      disabled={!canCancel}
                      onClick={() => setCancelOrderId(order._id)}
                      className={`flex-1 py-2 rounded-lg text-sm ${
                        canCancel
                          ? "bg-red-400 text-white"
                          : "bg-orange-500 text-white cursor-not-allowed"
                      }`}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <CancelConfirmModal
        open={!!cancelOrderId}
        loading={cancelLoading}
        onClose={() => setCancelOrderId(null)}
        onConfirm={confirmCancel}
      />

       {/* Reorder Modal */}
      <Modal
        open={!!reorderOrderId}
        icon={<RefreshCw className="text-emerald-600 w-6 h-6" />}
        title="Reorder Meal Box?"
        description="This will schedule the same meal box again."
        confirmText="Reorder"
        loading={actionLoading}
        onClose={() => setReorderOrderId(null)}
        onConfirm={confirmReorder}
      />
      
    </div>
  );
}
