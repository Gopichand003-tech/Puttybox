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
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function NotificationBell({ userId }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef();

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
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    }
  }, [showDropdown, notifications]);

  // close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon */}
      <button
        onClick={() => setShowDropdown((prev) => !prev)}
        className="relative flex items-center justify-center p-2 rounded-full hover:bg-emerald-100 transition focus:outline-none focus:ring-2 focus:ring-emerald-200"
        aria-haspopup="true"
        aria-expanded={showDropdown}
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6 text-emerald-700" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 -translate-y-1/3 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50"
            role="dialog"
            aria-label="Notifications panel"
          >
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
          </motion.div>
        )}
      </AnimatePresence>
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
  const mobileMenuRef = useRef();

  if (loading) return null;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      // mobile menu: clicking outside when open should close it
      if (mobileMenuOpen && mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileMenuOpen]);

  // close mobile menu on route change
  useEffect(() => {
    return () => setMobileMenuOpen(false);
    // note: cleanup runs on unmount; for route change you could add location listener if needed
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
    <>
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/80 shadow-lg border-b border-green-200/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-20">
          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => {
              navigate("/home");
              setMobileMenuOpen(false);
            }}
            aria-label="Go to home"
          >
            <img
              src="/puttylogo1.png"
              alt="PUTTYBOX Logo"
              className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
            />
            <span className="font-extrabold text-2xl sm:text-3xl leading-none">
              <span className="text-green-600">PUTTY</span>
              <span className="text-black">BOX</span>
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-8 items-center text-lg">
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
              className="flex items-center gap-2 bg-gradient-to-r from-green-600 via-lime-500 to-green-500 text-white px-5 py-2 rounded-full shadow-lg hover:shadow-green-400/50 hover:scale-105 transition-all"
            >
              <ShoppingCart size={18} /> Quick Order
            </Button>

            {user && (
              <Button
                onClick={() => navigate("/dashboard")}
                className="flex items-center gap-2 bg-gradient-to-tr from-green-600 to-lime-500 text-white px-4 py-2 rounded-full shadow-lg hover:scale-105 transition-transform"
              >
                <User size={18} /> Dashboard
              </Button>
            )}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-3 md:gap-6">
            {user && <NotificationBell userId={user._id} />}

            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center justify-center w-11 h-11 rounded-full border border-green-300 bg-green-50 hover:shadow-lg transition focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  aria-haspopup="true"
                  aria-expanded={dropdownOpen}
                >
                  <img
                    src={getProfilePic(user.profilePic)}
                    alt={user.name || "User"}
                    className="w-full h-full rounded-full object-cover"
                  />
                  {isPremiumActive ? (
                    <div className="absolute -top-2 -right-2 group">
                      <div className="bg-white p-1 rounded-full shadow-lg ring-2 ring-yellow-300">
                        <Crown className="w-4 h-4 text-yellow-500" />
                      </div>
                    </div>
                  ) : (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                  )}
                </button>

                {/* Profile dropdown (desktop) */}
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.97, y: -6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.97, y: -6 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-3 w-80 bg-white/90 backdrop-blur-xl border border-green-100 rounded-3xl shadow-2xl p-6 space-y-5 z-40"
                      role="menu"
                      aria-label="Profile menu"
                    >
                      {/* Profile Info */}
                      <div className="flex flex-col items-center text-center border-b border-green-100 pb-4 bg-gradient-to-br from-green-50 to-white rounded-2xl p-2">
                        <div className="relative w-24 h-24">
                          <img
                            src={getProfilePic(user.profilePic)}
                            alt={user.name || "User"}
                            className="w-full h-full rounded-full object-cover border-4 border-green-300 shadow-lg"
                          />
                          {isPremiumActive ? (
                            <div className="absolute -top-3 -right-3 group">
                              <div className="bg-white p-1.5 rounded-full shadow-lg ring-2 ring-yellow-300">
                                <Crown className="w-4 h-4 text-yellow-500" />
                              </div>
                            </div>
                          ) : null}
                        </div>
                        <p className="flex items-center gap-2 text-green-800 font-bold text-lg mt-4">
                          <User className="w-5 h-5" /> {user.name || "User"}
                        </p>
                        <p className="flex items-center gap-2 text-purple-800 text-sm truncate">
                          <Mail className="w-4 h-5" /> {user.email || "No email available"}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-3">
                        <button
                          onClick={() => {
                            navigate("/profile");
                            setDropdownOpen(false);
                          }}
                          className="flex items-center gap-3 w-full px-5 py-3 bg-gradient-to-r from-green-500 to-lime-400 text-white rounded-xl shadow-md hover:scale-105 transition-transform"
                        >
                          <User className="w-5 h-5" /> Profile
                        </button>
                        <button
                          onClick={() => {
                            navigate("/quickorder");
                            setDropdownOpen(false);
                          }}
                          className="flex items-center gap-3 w-full px-5 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-xl shadow-md hover:scale-105 transition-transform"
                        >
                          <Utensils className="w-5 h-5" /> Quick Orders
                        </button>
                        <button
                          onClick={() => {
                            handleLogout();
                            setDropdownOpen(false);
                          }}
                          className="flex items-center gap-3 w-full px-5 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl shadow-md hover:scale-105 transition-transform"
                        >
                          <LogOut className="w-5 h-5" /> Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              // if not logged in, show login / signup CTA
              <div className="hidden md:flex gap-2">
                <Button onClick={() => navigate("/login")} className="px-4 py-2">
                  Login
                </Button>
                <Button onClick={() => navigate("/signup")} className="px-4 py-2 bg-gradient-to-r from-green-600 to-lime-500 text-white">
                  Sign up
                </Button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Open mobile menu"
            >
              <Menu className="w-6 h-6 text-green-700" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.45 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 bg-black z-40"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />

            {/* Drawer */}
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.22 }}
              className="fixed top-0 right-0 bottom-0 w-80 max-w-full z-50 bg-white shadow-2xl p-6 overflow-y-auto"
              ref={mobileMenuRef}
              role="dialog"
              aria-label="Mobile menu"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3" onClick={() => { navigate("/home"); setMobileMenuOpen(false); }}>
                  <img src="/puttylogo1.png" alt="logo" className="w-10 h-10 object-contain" />
                  <span className="font-extrabold text-xl">
                    <span className="text-green-600">PUTTY</span><span className="text-black">BOX</span>
                  </span>
                </div>
                <button
                  className="p-2 rounded-md hover:bg-gray-100 focus:outline-none"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close menu"
                >
                  <XCircle className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex flex-col gap-3">
                {navItems.map((item) => (
                  <NavLink
                    key={item.label}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium ${
                        isActive ? "bg-emerald-50 text-emerald-800" : "text-gray-700 hover:bg-gray-50"
                      }`
                    }
                  >
                    {item.icon} {item.label}
                  </NavLink>
                ))}
              </nav>

              <div className="mt-5 space-y-4">
                <Button
                  onClick={() => {
                    navigate("/quickorder");
                    setMobileMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 via-lime-500 to-green-500 text-white rounded-full shadow"
                >
                  <ShoppingCart size={18} /> Quick Order
                </Button>

                {user && (
                  <Button
                    onClick={() => {
                      navigate("/dashboard");
                      setMobileMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-4 py-3 bg-gradient-to-tr from-green-600 to-lime-500 text-white rounded-full shadow"
                  >
                    <User size={18} /> Dashboard
                  </Button>
                )}
              </div>

              <div className="mt-6 border-t pt-6">
                {user ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <img src={getProfilePic(user.profilePic)} alt="profile" className="w-12 h-12 rounded-full object-cover" />
                      <div>
                        <p className="font-semibold text-gray-800">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        navigate("/profile");
                        setMobileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-3"
                    >
                      <User className="w-5 h-5" /> Profile
                    </button>

                    <button
                      onClick={() => {
                        navigate("/quickorder");
                        setMobileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-3"
                    >
                      <Utensils className="w-5 h-5" /> Quick Orders
                    </button>

                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-3 text-red-600"
                    >
                      <LogOut className="w-5 h-5" /> Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Button onClick={() => { navigate("/login"); setMobileMenuOpen(false); }} className="w-full">Login</Button>
                    <Button onClick={() => { navigate("/signup"); setMobileMenuOpen(false); }} className="w-full bg-gradient-to-r from-green-600 to-lime-500 text-white">Sign up</Button>
                  </div>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* spacer so page content doesn't jump under header */}
      <div className="h-20" aria-hidden="true" />
    </>
  );
};

export default Header;
