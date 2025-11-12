import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Bell,
  Menu,
  User,
  LogOut,
  Utensils,
  Home,
  Mail,
  Sparkles,
  Crown,
  ShoppingCart,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { useAuth } from "../context/Authcontext";
import { Button } from "./ui/button";
import { motion, AnimatePresence } from "framer-motion";
import io from "socket.io-client";

const socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000");
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000" ;

function NotificationBell({ userId }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  /* 🧩 Fetch user's notifications from backend */
  useEffect(() => {
    if (!userId) return;

    const fetchNotifications = async () => {
      try {
        const res = await fetch(`${API_URL}/api/notifications/${userId}`);
        const data = await res.json();

        const list = Array.isArray(data)
          ? data
          : Array.isArray(data.notifications)
          ? data.notifications
          : [];

        // Sort by most recent
        const sorted = list.sort(
          (a, b) => new Date(b.createdAt || b.time) - new Date(a.createdAt || a.time)
        );

        setNotifications(sorted);
        setUnreadCount(sorted.filter((n) => !n.isRead).length);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    };

    fetchNotifications();
  }, [userId]);

  /* 🔔 Real-time listener for new notifications */
  useEffect(() => {
    if (!userId) return;

    const handleNew = (notification) => {
      if (notification.userId === userId) {
        setNotifications((prev) => [notification, ...(Array.isArray(prev) ? prev : [])]);
        setUnreadCount((prev) => prev + 1);
      }
    };

    socket.on("newNotification", handleNew);
    return () => socket.off("newNotification", handleNew);
  }, [userId]);

  /* ✅ Mark all unread as read when dropdown opens */
  useEffect(() => {
    if (showDropdown && notifications.some((n) => !n.isRead)) {
      const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n._id);

      // Update backend
      Promise.all(
        unreadIds.map((id) =>
          fetch(`${API_URL}/api/notifications/read/${id}`, { method: "PUT" })
        )
      ).catch((err) => console.error("Error marking read:", err));

      // Update frontend
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
      setUnreadCount(0);
    }
  }, [showDropdown, notifications]);

  return (
     <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setShowDropdown((prev) => !prev)}
        className="relative flex items-center justify-center p-2 rounded-full hover:bg-emerald-100 transition"
      >
        <Bell className="w-6 h-6 text-emerald-700" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {showDropdown && (
        <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50">
          <div className="p-3 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-emerald-800 font-semibold">Notifications</h3>
            {notifications.length > 0 && (
              <button
                onClick={() => {
                  setNotifications([]);
                  setUnreadCount(0);
                }}
                className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1"
              >
                <XCircle className="w-3 h-3" /> Clear
              </button>
            )}
          </div>

          {/* Notification list */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <div
                  key={n._id}
                  className={`p-3 border-b last:border-0 text-sm ${
                    n.isRead ? "bg-white" : "bg-emerald-50"
                  } hover:bg-emerald-100 transition`}
                >
                  <p className="text-gray-800">{n.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(n.time || n.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500 text-sm">
                <CheckCircle2 className="w-5 h-5 mx-auto mb-1 text-emerald-400" />
                No new notifications
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ✅ Main Header
const Header = () => {
  const { user, logoutUser, isPremiumActive, loading } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef();

  if (loading) return null;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logoutUser();
    navigate("/");
  };

  const getProfilePic = (profilePic) => {
    if (!profilePic || profilePic.trim() === "") {
      return "https://cdn-icons-png.flaticon.com/512/1077/1077012.png";
    }
    return profilePic.startsWith("http")
      ? profilePic
      : `${import.meta.env.VITE_API_URL}/${profilePic}`;
  };

  const navItems = [
    { label: "Home", path: "/home", icon: <Home size={18} /> },
    { label: "Meal Plans", path: "/mealplan", icon: <Utensils size={18} /> },
    { label: "Customize", path: "/customize", icon: <Sparkles size={18} /> },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/80 shadow-lg border-b border-green-200/40">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 flex justify-between items-center h-20">
        {/* Logo */}
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate("/home")}
        >
          <img src="/puttylogo1.png" alt="PUTTYBOX Logo" className="w-12 h-13 object-contain" />
          <span className="font-extrabold text-3xl">
            <span className="text-green-600">PUTTY</span>
            <span className="text-black">BOX</span>
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-10 items-center text-lg">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-2 font-semibold transition-all duration-200 ${
                  isActive
                    ? "text-green-800 border-b-2 border-green-600 pb-1"
                    : "text-green-700 hover:text-green-600"
                }`
              }
            >
              {item.icon} {item.label}
            </NavLink>
          ))}

          <Button
            onClick={() => navigate("/quickorder")}
            className="flex items-center gap-2 bg-gradient-to-r from-green-600 via-lime-500 to-green-500 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-green-400/50 hover:scale-105 transition-all"
          >
            <ShoppingCart size={18} /> Quick Order
          </Button>

          {user && (
            <Button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 bg-gradient-to-tr from-green-600 to-lime-500 text-white px-5 py-3 rounded-full shadow-lg hover:scale-105 transition-transform"
            >
              <User size={18} /> Dashboard
            </Button>
          )}
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-4 md:gap-6">
          {user && <NotificationBell userId={user._id} />}

          {user && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center justify-center w-12 h-12 rounded-full border border-green-300 bg-green-50 hover:shadow-lg transition"
              >
                <img
                  src={getProfilePic(user.profilePic)}
                  alt={user.name || "User"}
                  className="w-full h-full rounded-full object-cover"
                />
                {isPremiumActive ? (
                  <div className="absolute -top-3 -right-3 group">
                    <div className="bg-white p-1.5 rounded-full shadow-lg ring-2 ring-yellow-300">
                      <Crown className="w-4 h-4 text-yellow-500 drop-shadow-[0_0_6px_rgba(255,215,0,0.9)]" />
                    </div>
                    <span className="absolute right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 bg-blue-900 text-white text-xs font-semibold px-3 py-1 rounded-lg shadow-md transition-opacity duration-200 whitespace-nowrap">
                      Premium Member
                    </span>
                  </div>
                ) : (
                  <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></span>
                )}
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white/90 backdrop-blur-xl border border-green-100 rounded-3xl shadow-2xl p-6 space-y-5 animate-fadeIn">
                  {/* Profile Info */}
                  <div className="flex flex-col items-center text-center border-b border-green-100 pb-4 bg-gradient-to-br from-green-50 to-white rounded-2xl p-2">
                    <div className="relative w-24 h-24">
                      <img
                        src={getProfilePic(user.profilePic)}
                        alt={user.name || "User"}
                        className="w-full h-full rounded-full object-cover border-4 border-green-300 shadow-lg hover:scale-105 transition-transform"
                      />
                      {isPremiumActive ? (
                        <div className="absolute -top-3 -right-3 group">
                          <div className="bg-white p-1.5 rounded-full shadow-lg ring-2 ring-yellow-300">
                            <Crown className="w-4 h-4 text-yellow-500 drop-shadow-[0_0_6px_rgba(255,215,0,0.9)]" />
                          </div>
                          <span className="absolute right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 bg-blue-900 text-white text-xs font-semibold px-3 py-1 rounded-lg shadow-md transition-opacity duration-200 whitespace-nowrap">
                            Premium Member
                          </span>
                        </div>
                      ) : (
                        <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></span>
                      )}
                    </div>
                    <p className="flex items-center gap-2 text-green-800 font-bold text-lg mt-4 hover:text-green-600 transition-colors">
                      <User className="w-5 h-5" /> {user.name || "User"}
                    </p>
                    <p className="flex items-center gap-2 text-purple-800 text-m truncate hover:text-purple-600 transition-colors">
                      <Mail className="w-4 h-5" /> {user.email || "No email available"}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => navigate("/profile")}
                      className="flex items-center gap-3 w-full px-5 py-3 bg-gradient-to-r from-green-500 to-lime-400 text-white rounded-xl shadow-md hover:scale-105 transition-transform"
                    >
                      <User className="w-5 h-5" /> Profile
                    </button>
                    <button
                      onClick={() => navigate("/quickorder")}
                      className="flex items-center gap-3 w-full px-5 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-xl shadow-md hover:scale-105 transition-transform"
                    >
                      <Utensils className="w-5 h-5" /> Quick Orders
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-5 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl shadow-md hover:scale-105 transition-transform"
                    >
                      <LogOut className="w-5 h-5" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mobile Menu */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="w-6 h-6 text-green-700" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
