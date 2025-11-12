import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [isPremiumActive, setIsPremiumActive] = useState(false);
  const [loading, setLoading] = useState(true);

  // -------------------------
  // 🔹 Axios global defaults
  // -------------------------
  axios.defaults.withCredentials = true;
  axios.defaults.baseURL =
    import.meta.env.VITE_API_URL || "http://localhost:5000";

  // -------------------------
  // 🔹 Helper - Check Premium Validity
  // -------------------------
  const checkPremiumValidity = (u) => {
    if (!u?.isPremium || !u?.premiumExpiry) {
      setIsPremiumActive(false);
      return;
    }
    const now = new Date();
    const expiry = new Date(u.premiumExpiry);
    setIsPremiumActive(now <= expiry);
  };

  // -------------------------
  // 🔹 Fetch user on mount
  // -------------------------
  const fetchUser = async () => {
    try {
      const res = await axios.get(`/api/auth/me`, { withCredentials: true });
      const u = res.data?.user;
      setUser(u || null);
      setIsPremium(u?.isPremium || false);
      checkPremiumValidity(u);
    } catch (err) {
      console.log("No active session:", err.response?.data || err.message);
      setUser(null);
      setIsPremium(false);
      setIsPremiumActive(false);
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // 🔹 Login with email/password
  // -------------------------
  const loginUser = async (email, password) => {
    try {
      const res = await axios.post(
        `/api/auth/login`,
        { email, password },
        { withCredentials: true }
      );
      const u = res.data?.user;
      setUser(u);
      setIsPremium(u?.isPremium || false);
      checkPremiumValidity(u);
      return true;
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      return false;
    }
  };

  // -------------------------
  // 🔹 Login with Google
  // -------------------------
  const loginWithGoogle = async (token) => {
    try {
      const res = await axios.post(
        `/api/auth/google-login`,
        { token },
        { withCredentials: true }
      );
      const u = res.data?.user;
      setUser(u);
      setIsPremium(u?.isPremium || false);
      checkPremiumValidity(u);
      return true;
    } catch (err) {
      console.error("Google login error:", err.response?.data || err.message);
      return false;
    }
  };

  // -------------------------
  // 🔹 Logout (clear cookie)
  // -------------------------
  const logoutUser = async () => {
    try {
      await axios.post(`/api/auth/logout`, {}, { withCredentials: true });
    } catch (err) {
      console.error("Logout error:", err.message);
    } finally {
      // Always clear client state, even if backend fails
      setUser(null);
      setIsPremium(false);
      setIsPremiumActive(false);
    }
  };

  // -------------------------
  // 🔹 Activate Premium
  // -------------------------
  const activatePremium = async (months = 1) => {
    try {
      const res = await axios.post(
        `/api/auth/upgrade-premium`,
        { durationMonths: months },
        { withCredentials: true }
      );
      const u = res.data?.user;
      setUser(u);
      setIsPremium(true);
      checkPremiumValidity(u);
    } catch (err) {
      console.error("Failed to activate premium:", err.message);
    }
  };

  // -------------------------
  // 🔹 Update User (profile, etc.)
  // -------------------------
  const updateUser = (updatedUser) => {
    setUser((prev) => ({ ...prev, ...updatedUser }));
    checkPremiumValidity(updatedUser);
  };

  // -------------------------
  // 🔹 Auto-fetch user on mount
  // -------------------------
  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isPremium,
        isPremiumActive,
        loginUser,
        loginWithGoogle,
        logoutUser,
        updateUser,
        activatePremium,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
