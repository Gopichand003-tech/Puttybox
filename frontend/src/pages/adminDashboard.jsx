// src/pages/adminDashboard.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Home,
  ShoppingBag,
  Users,
  Settings,
  LogOut,
  Activity,
  Search,
  Trash2,
  XCircle,
  UserPlus,
  UserMinus,
  Truck,
  User as UserIcon,
  MapPin,
  Phone,
} from "lucide-react";
import { toast } from "sonner";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

axios.defaults.withCredentials = true;

export default function AdminDashboard() {
  // ---------- State ----------
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState("Overview"); // Overview | Orders | Users | Analytics | Settings
  const [loading, setLoading] = useState(false);

  // Data
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const ordersRef = useRef([]);
  const [users, setUsers] = useState([]);

  // Filters / search / pagination
  const [ordersFilter, setOrdersFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [ordersPage, setOrdersPage] = useState(1);
  const ORDERS_PER_PAGE = 10;

  // Auto lifecycle config (milliseconds)
  const AUTO_CONFIG = {
    pendingWindow: 20 * 1000, // 20s
    confirmToCooking: 60 * 1000, // 60s
    cookingWindow: 2 * 60 * 1000, // 2min
    outForDeliveryWindow: 2 * 60 * 1000, // 2min
    checkInterval: 5000, // 5s
  };

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // Keep ref in sync for intervals
  useEffect(() => {
    ordersRef.current = orders;
  }, [orders]);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // -------------------------
  // API calls
  // -------------------------
  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/api/admin/admin-dash`);
      setStats(data.stats || null);
      if (data.orders) setOrders(data.orders);
    } catch (err) {
      console.error("fetchDashboard error:", err);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/admin/orders`);
      setOrders(Array.isArray(data) ? data : data.orders || []);
    } catch (err) {
      console.error("fetchOrders error:", err);
      toast.error("Failed to load orders");
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/admin/users`);
      setUsers(Array.isArray(data) ? data : data.users || []);
    } catch (err) {
      console.error("fetchUsers error:", err);
      toast.error("Failed to load users");
    }
  };

  // -------------------------
  // Actions
  // -------------------------
  const updateOrderStatus = async (orderId, newStatus) => {
    const prev = [...ordersRef.current];
    try {
      // optimistic
      setOrders((curr) => curr.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o)));
      await axios.put(
        `${API_URL}/api/admin/orders/${orderId}/status`,
        { status: newStatus },
        { withCredentials: true }
      );
      toast.success(`Order marked ${newStatus}`);
      // lightweight server sync (we keep local UI snappy)
      fetchOrders();
      fetchDashboard();
    } catch (err) {
      console.error("updateOrderStatus err:", err);
      setOrders(prev); // rollback
      toast.error("Failed to update order");
    }
  };

  const deleteOrder = async (orderId) => {
    if (!confirm("Delete this order? This action cannot be undone.")) return;
    try {
      await axios.delete(`${API_URL}/api/admin/orders/${orderId}`);
      toast.success("Order deleted");
      setOrders((curr) => curr.filter((o) => o._id !== orderId));
      fetchDashboard();
    } catch (err) {
      console.error("deleteOrder err:", err);
      toast.error("Failed to delete order");
    }
  };

  const toggleBlockUser = async (userId, block) => {
    const prev = [...users];
    try {
      setUsers((curr) => curr.map((u) => (u._id === userId ? { ...u, blocked: block } : u)));
      await axios.put(`${API_URL}/api/admin/users/${userId}`, { blocked: block });
      toast.success(block ? "User blocked" : "User unblocked");
    } catch (err) {
      console.error("toggleBlockUser err:", err);
      setUsers(prev);
      toast.error("Failed to update user");
    }
  };

  const deleteUser = async (userId) => {
    if (!confirm("Delete this user and all related data?")) return;
    try {
      await axios.delete(`${API_URL}/api/admin/users/${userId}`);
      toast.success("User deleted");
      setUsers((curr) => curr.filter((u) => u._id !== userId));
    } catch (err) {
      console.error("deleteUser err:", err);
      toast.error("Failed to delete user");
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${API_URL}/api/admin/logout`);
      toast.success("Logged out successfully");
      window.location.href = "/";
    } catch (err) {
      console.error("admin logout err:", err);
      toast.error("Logout failed");
    }
  };

  // -------------------------
  // Auto Order Lifecycle (local, smooth)
  // -------------------------
  useEffect(() => {
    const checkAndAdvance = () => {
      const now = Date.now();
      setOrders((prev) =>
        prev.map((order) => {
          if (!order.createdAt) return order;
          const created = new Date(order.createdAt).getTime();
          const age = now - created;
          const cur = (order.status || "").toLowerCase();

          // ignore terminal states
          if (["delivered", "cancelled"].includes(cur)) return order;

          let newStatus = cur;
          if (age < AUTO_CONFIG.pendingWindow) newStatus = "pending";
          else if (age < AUTO_CONFIG.confirmToCooking) newStatus = "confirmed";
          else if (age < AUTO_CONFIG.cookingWindow) newStatus = "cooking";
          else if (age < AUTO_CONFIG.outForDeliveryWindow) newStatus = "out for delivery";
          else newStatus = "delivered";

          if (newStatus !== cur) return { ...order, status: newStatus };
          return order;
        })
      );
    };

    const id = setInterval(checkAndAdvance, AUTO_CONFIG.checkInterval);
    // run once immediately
    checkAndAdvance();
    return () => clearInterval(id);
  }, []);

  // -------------------------
  // Initial fetch + periodic refresh
  // -------------------------
  useEffect(() => {
    fetchDashboard();
    fetchOrders();
    fetchUsers();

    const refresh = setInterval(() => {
      fetchDashboard();
      fetchOrders();
    }, 60_000); // 60s

    return () => clearInterval(refresh);
  }, []);

  // -------------------------
  // Derived data
  // -------------------------
  const filteredOrders = useMemo(() => {
    let list = orders || [];
    if (ordersFilter !== "all") {
      list = list.filter((o) => (o.status || "").toLowerCase() === ordersFilter.toLowerCase());
    }
    if (debouncedQuery) {
      const q = debouncedQuery.toLowerCase();
      list = list.filter(
        (o) =>
          (o.customerName || "").toLowerCase().includes(q) ||
          (o._id || "").toLowerCase().includes(q) ||
          (o.status || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [orders, ordersFilter, debouncedQuery]);

  const paginatedOrders = useMemo(() => {
    const start = (ordersPage - 1) * ORDERS_PER_PAGE;
    return filteredOrders.slice(start, start + ORDERS_PER_PAGE);
  }, [filteredOrders, ordersPage]);

  const chartData = useMemo(() => {
    if (stats?.monthlyRevenue) return stats.monthlyRevenue;
    if (!orders?.length) {
      return [
        { date: "Day -6", revenue: 0, orders: 0 },
        { date: "Day -5", revenue: 0, orders: 0 },
        { date: "Day -4", revenue: 0, orders: 0 },
        { date: "Day -3", revenue: 0, orders: 0 },
        { date: "Day -2", revenue: 0, orders: 0 },
        { date: "Day -1", revenue: 0, orders: 0 },
        { date: "Today", revenue: 0, orders: 0 },
      ];
    }
    const map = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString();
      map[key] = { date: key, revenue: 0, orders: 0 };
    }
    orders.forEach((o) => {
      const key = new Date(o.createdAt).toLocaleDateString();
      if (!map[key]) map[key] = { date: key, revenue: 0, orders: 0 };
      map[key].revenue += Number(o.price || o.total || 0);
      map[key].orders += 1;
    });
    return Object.values(map);
  }, [stats, orders]);

  const statusVideos = {
    pending: "/videos/pending.mp4",
    confirmed: "/videos/confirmed.mp4",
    cooking: "/videos/cooking.mp4",
    "out for delivery": "/videos/Delivery.mp4",
    cancelled: "/videos/cancelled.mp4",
    delivered: "/videos/delivered.mp4",
  };

  // ---------- Small UI components ----------
  const SidebarButton = ({ icon: Icon, label }) => (
    <motion.button
      whileHover={{ scale: 1.05 }}
      onClick={() => setActivePage(label)}
      className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition text-sm font-medium ${
        activePage === label
          ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-400 shadow-[0_0_18px_rgba(99,102,241,0.18)]"
          : "text-gray-300 hover:bg-white/5"
      }`}
    >
      <Icon className="w-5 h-5" />
      {label}
    </motion.button>
  );

  const VideoCircle = ({ src, status }) => {
    if (!src) return null;
    return (
      <div className="flex items-center justify-center mt-4">
        <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-full overflow-hidden shadow-2xl ring-4 ring-indigo-600/20">
          <AnimatePresence mode="wait">
            <motion.video
              key={status}
              src={src}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
            />
          </AnimatePresence>

          <div className="absolute inset-0 flex items-end justify-center pb-3 pointer-events-none">
            <div className="bg-black/50 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
              {status}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // -------------------------
  // UI Sections
  // -------------------------
  const OverviewSection = () => (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Total Orders", value: stats?.orders || 0, icon: ShoppingBag },
          { title: "Active Users", value: stats?.users || 0, icon: Users },
          {
            title: "Revenue",
            value: `₹${Number(stats?.revenue || 0).toLocaleString("en-IN")}`,
            icon: Activity,
          },
          { title: "Delivered Orders", value: stats?.delivered || 0, icon: Home },
        ].map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="relative group p-6 rounded-2xl bg-white/5 border border-white/8 hover:border-indigo-400/20 shadow-lg backdrop-blur-md transition-all"
          >
            <div className="relative flex items-center justify-between">
              <div>
                <h3 className="text-sm text-gray-300">{card.title}</h3>
                <p className="text-3xl font-extrabold mt-2 text-white">{card.value}</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
                <card.icon size={24} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white/5 rounded-2xl p-6 shadow-xl border border-white/8">
          <h4 className="font-semibold text-lg mb-3 text-white">Revenue (Last 7 days)</h4>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="date" tick={{ fill: "#bbb" }} />
              <YAxis tick={{ fill: "#bbb" }} />
              <Tooltip contentStyle={{ background: "#0b1220", border: "none" }} />
              <Legend wrapperStyle={{ color: "#bbb" }} />
              <Line type="monotone" dataKey="revenue" stroke="#7c83ff" strokeWidth={2} dot />
              <Line type="monotone" dataKey="orders" stroke="#4fd1c5" strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white/5 rounded-2xl p-6 shadow-xl border border-white/8">
          <h4 className="font-semibold text-lg mb-3 text-white">Quick Actions</h4>
          <div className="flex flex-col gap-3">
            <button onClick={() => setActivePage("Orders")} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-md">Manage Orders</button>
            <button onClick={() => setActivePage("Users")} className="px-4 py-2 bg-white/5 rounded-lg text-white">Manage Users</button>
            <button onClick={() => { navigator.clipboard.writeText(window.location.origin); toast.success("Base URL copied"); }} className="px-4 py-2 bg-white/5 rounded-lg text-white">Copy Base URL</button>
          </div>
        </div>
      </div>
    </>
  );

  const OrdersSection = () => (
    <>
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white/5 rounded-lg p-2">
            <Search className="w-4 h-4 text-gray-300" />
            <input
              className="ml-2 outline-none bg-transparent text-gray-200"
              placeholder="Search orders, customer, id..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setOrdersPage(1);
              }}
            />
          </div>

          <select
            value={ordersFilter}
            onChange={(e) => {
              setOrdersFilter(e.target.value);
              setOrdersPage(1);
            }}
            className="px-3 py-2 rounded-lg bg-white/5 text-gray-200"
          >
            <option value="all">All</option>
            <option value="pending">pending</option>
            <option value="confirmed">confirmed</option>
            <option value="cooking">cooking</option>
            <option value="out for delivery">Out for Delivery</option>
            <option value="cancelled">cancelled</option>
          </select>
        </div>

        <div className="text-sm text-gray-400">Showing {filteredOrders.length} result(s)</div>
      </div>

      <div className="bg-white/5 rounded-2xl shadow p-4 overflow-x-auto border border-white/8">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-300 border-b">
              <th className="py-3">#</th>
              <th className="py-3">Customer</th>
              <th className="py-3">Items</th>
              <th className="py-3">Price</th>
              <th className="py-3">Status</th>
              <th className="py-3">Date</th>
              <th className="py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedOrders.length ? (
              paginatedOrders.map((o, i) => (
                <tr key={o._id} className="border-b hover:bg-white/3 align-top">
                  <td className="py-3 align-top">{(ordersPage - 1) * ORDERS_PER_PAGE + i + 1}</td>
                  <td className="py-3 font-medium align-top">{o.customerName || o.user?.name || "Unknown"}</td>
                  <td className="py-3 max-w-xs align-top">{(o.items || []).map((it) => it.name).join(", ")}</td>
                  <td className="py-3 align-top">₹{o.price ?? o.total ?? 0}</td>
                  <td className="py-3 align-top">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      (o.status || "").toLowerCase() === "confirmed"
                        ? "bg-green-100 text-green-800"
                        : (o.status || "").toLowerCase() === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : (o.status || "").toLowerCase() === "cancelled"
                        ? "bg-red-100 text-red-800"
                        : "bg-blue-100 text-blue-800"
                    }`}>
                      {o.status || "pending"}
                    </span>
                  </td>
                  <td className="py-3 text-gray-400 align-top">{new Date(o.createdAt).toLocaleString()}</td>
                  <td className="py-3 flex gap-2 align-top">
                    {(o.status || "").toLowerCase() === "pending" && (
                      <button onClick={() => updateOrderStatus(o._id, "cancelled")} className="px-3 py-1 bg-red-600 text-white rounded-md text-sm flex items-center gap-2">
                        <XCircle size={14} /> Cancel
                      </button>
                    )}

                    <button onClick={() => deleteOrder(o._id)} className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-md text-sm">
                      <Trash2 size={14} /> Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="py-10 text-center text-gray-400">No orders found</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-400">
            Page {ordersPage} / {Math.max(1, Math.ceil(filteredOrders.length / ORDERS_PER_PAGE))}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setOrdersPage((p) => Math.max(1, p - 1))} className="px-3 py-1 bg-white/5 rounded">Prev</button>
            <button onClick={() => setOrdersPage((p) => Math.min(Math.ceil(filteredOrders.length / ORDERS_PER_PAGE), p + 1))} className="px-3 py-1 bg-white/5 rounded">Next</button>
          </div>
        </div>
      </div>

      {/* Active Orders (Live preview) */}
      <div className="mt-8 space-y-6">
        <h3 className="text-xl font-bold">Active Orders (Live preview)</h3>

        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-6" transition={{ layout: { duration: 0.45, ease: "easeInOut" } }}>
          <AnimatePresence mode="popLayout">
            {orders
              .filter((o) => !["delivered", "cancelled"].includes((o.status || "").toLowerCase()))
              .slice(0, 6)
              .map((order) => {
                const s = (order.status || "pending").toLowerCase();
                const videoSrc = statusVideos[s];
                const deliveryCharge = stats?.premium ? 0 : 40;
                const displayTotal = (order.total ?? order.price ?? 0) + deliveryCharge;

                return (
                  <motion.div
                    key={order._id}
                    layout
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    transition={{ duration: 0.35 }}
                    className="bg-white/5 rounded-2xl p-5 shadow-xl flex gap-4 items-center"
                  >
                    <div className="flex-shrink-0">
                      <VideoCircle src={videoSrc} status={s} />
                    </div>

                    <div className="flex-1">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h4 className="font-semibold text-white">{(order.items || []).map((it) => it.name).join(", ")}</h4>
                          <div className="text-xs text-gray-400 mt-1">{new Date(order.createdAt).toLocaleString()}</div>
                        </div>

                        <div className="text-right">
                          <div className="text-lg font-semibold text-white">₹{displayTotal}</div>
                          <div className={`mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                            s === "delivered" ? "bg-green-100 text-green-800" : s === "pending" ? "bg-yellow-100 text-yellow-800" : "bg-blue-100 text-blue-800"
                          }`}>
                            {order.status}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 text-sm text-gray-300 space-y-2">
                        <div className="flex items-center gap-2">
                          <UserIcon className="w-4 h-4 text-indigo-400" />
                          <span className="font-medium">{order.user?.name || order.customerName || "Unknown"}</span>
                          {order.user?.email && <span className="ml-2 text-xs text-gray-400">({order.user.email})</span>}
                        </div>

                        {order.address && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-red-400" />
                            <span className="text-gray-300">{order.address}</span>
                          </div>
                        )}

                        {order.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-green-400" />
                            <span className="text-gray-300">{order.phone}</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 flex gap-2">
                        <button onClick={() => updateOrderStatus(order._id, "cancelled")} className="px-3 py-1 bg-red-600 text-white rounded-md text-sm">Cancel</button>
                        <button onClick={() => updateOrderStatus(order._id, "cooking")} className="px-3 py-1 bg-indigo-600 text-white rounded-md text-sm">Set Cooking</button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  );

  const UsersSection = () => (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">Users</h3>
        <div className="text-sm text-gray-400">{users.length} total</div>
      </div>

      <div className="bg-white/5 rounded-2xl p-4 shadow-xl">
        <ul className="divide-y">
          {users.length ? (
            users.map((u) => (
              <li key={u._id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium text-white">{u.name}</div>
                  <div className="text-xs text-gray-400">{u.email}</div>
                </div>

                <div className="flex items-center gap-3">
                  <button onClick={() => toggleBlockUser(u._id, !u.blocked)} className={`px-3 py-1 rounded text-sm ${u.blocked ? "bg-green-600 text-white" : "bg-white/5 text-white"}`} title={u.blocked ? "Unblock user" : "Block user"}>
                    {u.blocked ? <UserPlus size={16} /> : <UserMinus size={16} />} {u.blocked ? "Unblock" : "Block"}
                  </button>

                  <button onClick={() => deleteUser(u._id)} className="px-3 py-1 rounded bg-red-600 text-white text-sm">Delete</button>
                </div>
              </li>
            ))
          ) : (
            <li className="py-6 text-center text-gray-400">No users found</li>
          )}
        </ul>
      </div>
    </div>
  );

  const AnalyticsSection = () => (
    <div>
      <h3 className="text-xl font-bold mb-4">Analytics</h3>
      <div className="bg-white/5 rounded-2xl p-6 shadow-xl">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="date" tick={{ fill: "#bbb" }} />
            <YAxis tick={{ fill: "#bbb" }} />
            <Tooltip contentStyle={{ background: "#0b1220", border: "none" }} />
            <Legend wrapperStyle={{ color: "#bbb" }} />
            <Line type="monotone" dataKey="revenue" stroke="#7c83ff" strokeWidth={2} />
            <Line type="monotone" dataKey="orders" stroke="#4fd1c5" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const SettingsSection = () => (
    <div>
      <h3 className="text-xl font-bold mb-4">Settings</h3>
      <div className="bg-white/5 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-white">Appearance</h4>
            <p className="text-sm text-gray-400">Toggle dark / light mode (client side)</p>
          </div>
          <div>
            <button onClick={() => toast("Toggled theme (placeholder)")} className="px-4 py-2 rounded bg-white/5 text-white">Toggle Theme</button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-white">Profile</h4>
            <p className="text-sm text-gray-400">Update admin profile details</p>
          </div>
          <div>
            <button className="px-4 py-2 rounded bg-indigo-600 text-white">Edit Profile</button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-white">Danger Zone</h4>
            <p className="text-sm text-gray-400">Reset system data or clear caches</p>
          </div>
          <div>
            <button onClick={() => toast.error("Reset action placeholder")} className="px-4 py-2 rounded bg-red-600 text-white">Reset</button>
          </div>
        </div>
      </div>
    </div>
  );

  // -------------------------
  // Render
  // -------------------------
  return (
    <div className="flex h-screen bg-gradient-to-br from-[#0b0f1a] via-[#0f1524] to-[#141922] text-gray-100">
      {/* Sidebar */}
      <motion.aside animate={sidebarOpen ? "open" : "closed"} initial={false} className="fixed md:static z-30 flex flex-col w-64 h-full bg-white/3 backdrop-blur-2xl border-r border-white/6">
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/8">
          <h1 className="text-2xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-500 text-transparent bg-clip-text">Admin</h1>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden">
            <X className="text-gray-200" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-3">
          <SidebarButton icon={Home} label="Overview" />
          <SidebarButton icon={ShoppingBag} label="Orders" />
          <SidebarButton icon={Users} label="Users" />
          <SidebarButton icon={Activity} label="Analytics" />
          <SidebarButton icon={Settings} label="Settings" />
        </nav>

        <div className="p-4 border-t border-white/8">
          <button onClick={handleLogout} className="flex items-center gap-2 w-full text-red-400 hover:text-red-300 font-medium">
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto md:ml-64">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/8 bg-white/2 backdrop-blur-lg sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden">
              <Menu className="text-gray-200" />
            </button>
            <h2 className="text-2xl font-bold text-white">{activePage}</h2>
            <div className="text-sm text-gray-400 hidden sm:block">Admin panel</div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-400">{stats ? `${stats.users} users` : ""}</div>
            <div className="flex items-center gap-2 bg-white/4 px-3 py-2 rounded-lg backdrop-blur">
              <Search className="w-4 h-4 text-gray-300" />
              <input placeholder="Quick search orders/users..." className="outline-none bg-transparent text-sm text-gray-200" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6 space-y-8">
          {loading && <div className="text-center text-gray-400">Loading data...</div>}

          {activePage === "Overview" && <OverviewSection />}

          {activePage === "Orders" && <OrdersSection />}

          {activePage === "Users" && <UsersSection />}

          {activePage === "Analytics" && <AnalyticsSection />}

          {activePage === "Settings" && <SettingsSection />}
        </div>
      </div>
    </div>
  );
}
