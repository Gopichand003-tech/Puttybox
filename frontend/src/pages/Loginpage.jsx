// src/pages/LoginPage.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { GoogleLogin } from "@react-oauth/google";
import { toast, Toaster } from "sonner";
import { useAuth } from "../context/Authcontext";
import axios from "axios";

export default function LoginPage() {
  const [isSignup, setIsSignup] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); // track admin mode
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingForgot, setLoadingForgot] = useState(false);

  const navigate = useNavigate();
  const { loginUser, loginWithGoogle } = useAuth();

  axios.defaults.withCredentials = true;
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const forgotModalRef = useRef(null);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // ------------------------------
  // Login / Signup / Admin Login
  // ------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isAdmin) {
        try {
          const { data } = await axios.post(
            `${API_URL}/api/admin/login`,
            {
              email: formData.email,
              password: formData.password,
            },
            { withCredentials: true }
          );

          toast.success("Admin login successful ✅");
          setTimeout(() => {
            navigate("/admin-dashboard");
          }, 700);
        } catch (err) {
          toast.error(err.response?.data?.message || "Admin login failed ❌");
        }
      } else if (isSignup) {
        // User Signup
        await axios.post("/api/auth/register", formData);
        await loginUser(formData.email, formData.password);
        toast.success("Signup Successful ✅");
        navigate("/home");
      } else {
        // User Login
        await loginUser(formData.email, formData.password);
        toast.success("Login Successful ✅");
        navigate("/home");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error occurred");
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------
  // Google Login
  // ------------------------------
  const handleGoogleLogin = async (credentialResponse) => {
    if (isAdmin) return toast.error("Admin login not available via Google");
    try {
      const { credential } = credentialResponse;
      const success = await loginWithGoogle(credential);
      if (success) {
        toast.success("Logged in with Google ✅");
        navigate("/home");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Google login failed");
    }
  };

  // ------------------------------
  // Forgot Password
  // ------------------------------
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setLoadingForgot(true);
    try {
      await axios.post("/api/auth/forgot-password", { email: forgotEmail });
      toast.success("Password reset link sent ✅");
      setForgotModalOpen(false);
      setForgotEmail("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error sending reset link");
    } finally {
      setLoadingForgot(false);
    }
  };

  // Close modal on ESC and manage body scroll
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setForgotModalOpen(false);
    };
    if (forgotModalOpen) {
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    } else {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [forgotModalOpen]);

  // Click outside to close forget modal (basic)
  useEffect(() => {
    const onClick = (e) => {
      if (
        forgotModalOpen &&
        forgotModalRef.current &&
        !forgotModalRef.current.contains(e.target)
      ) {
        setForgotModalOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [forgotModalOpen]);

  // ------------------------------
  // UI
  // ------------------------------
  return (
    <div className="min-h-screen w-full flex items-center justify-center relative bg-gray-100 dark:bg-gray-900 bg-cover bg-center"
>
      <Toaster position="top-center" richColors />

     
      {/* Main container:
          - Desktop: full-height visual experience
          - Mobile: adjusts height (min-h-[80vh]) so it doesn't force zoom/overflow
       */}
      <div className="w-full max-w-6xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-2xl rounded-3xl shadow-xl flex flex-col md:flex-row overflow-hidden border border-white/10 min-h-[80vh] md:min-h-screen mx-4 my-6">
        {/* Left Section (Video) - visible on md+ only.
            Use min-h-full so video doesn't force huge height on mobile.
        */}
        <div className="hidden md:flex md:w-3/5 relative min-h-full overflow-hidden">
          <video
            src="/puttylogin.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center px-6 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
              {isAdmin ? "Admin Portal" : isSignup ? "Join Us" : "Welcome Back"}
            </h1>
            <p className="mt-4 text-gray-200 text-sm md:text-lg max-w-md">
              {isAdmin
                ? "Manage orders and oversee operations"
                : isSignup
                ? "Sign up to unlock premium features."
                : "Log in to access your dashboard."}
            </p>
          </div>
        </div>

        {/* Right Section (Form) */}
<div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8">
  <div className="w-full max-w-sm sm:max-w-md bg-white/95 dark:bg-gray-900/95 rounded-2xl shadow-lg p-6 sm:p-8">
    
    {/* Logo */}
    <div className="flex items-center justify-center gap-2 sm:gap-3 mb-5">
      <img
        src="/puttylogo1.png"
        alt="PUTTYBOX"
        className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
      />
      <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-wide 
               bg-gradient-to-r from-green-600 via-emerald-500 to-black 
               bg-clip-text text-transparent">
  PUTTYBOX
</h1>

    </div>

    {/* Heading */}
    <h2
      className="
        text-lg sm:text-xl md:text-2xl
        font-bold text-center
        text-blue-900 dark:text-white
        mb-5 leading-snug
      "
    >
      {isAdmin
        ? "Admin Login"
        : isSignup
        ? "Create Your Account"
        : "Welcome Back"}
    </h2>

    {/* Form */}
    <form onSubmit={handleSubmit} className="space-y-4">
      
      {/* Name (signup only & not admin) */}
      {!isAdmin && isSignup && (
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          required
          className="
            w-full px-4 py-3 rounded-lg
            bg-gray-100/80 dark:bg-gray-800/70
            border border-gray-200/60
            focus:ring-2 focus:ring-emerald-300
            outline-none text-sm
          "
        />
      )}

      {/* Email */}
      <input
        type="email"
        name="email"
        placeholder="Email Address"
        value={formData.email}
        onChange={handleChange}
        required
        className="
          w-full px-4 py-3 rounded-lg
          bg-gray-100/80 dark:bg-gray-800/70
          border border-gray-200/60
          focus:ring-2 focus:ring-emerald-300
          outline-none text-sm
        "
      />

      {/* Password */}
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          className="
            w-full px-4 py-3 pr-12 rounded-lg
            bg-gray-100/80 dark:bg-gray-800/70
            border border-gray-200/60
            focus:ring-2 focus:ring-emerald-300
            outline-none text-sm
          "
        />
        <button
          type="button"
          onClick={() => setShowPassword((s) => !s)}
          aria-label={showPassword ? "Hide password" : "Show password"}
          className="
            absolute right-2 top-1/2 -translate-y-1/2
            p-2 rounded-md text-gray-600
            hover:bg-gray-200/60 dark:hover:bg-gray-700/60
          "
        >
          {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
        </button>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="
          w-full py-3 rounded-lg
          bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500
          text-white font-semibold text-sm
          hover:opacity-95 transition
        "
      >
        {loading
          ? "Processing..."
          : isAdmin
          ? "Admin Login"
          : isSignup
          ? "Sign Up"
          : "Login"}
      </button>

      {/* Forgot password */}
      {!isAdmin && !isSignup && (
        <div className="text-center">
          <button
            type="button"
            onClick={() => setForgotModalOpen(true)}
            className="text-xs sm:text-sm text-purple-600 hover:underline"
          >
            Forgot Password?
          </button>
        </div>
      )}

      {/* Google Login */}
      {!isAdmin && (
        <div className="flex justify-center pt-2">
          <div className="w-full max-w-xs">
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => toast.error("Google login failed")}
            />
          </div>
        </div>
      )}
    </form>
  

            {/* Switch Modes */}
            <div className="mt-4 text-center text-sm space-y-2">
              {!isAdmin && (
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
                  <button
                    onClick={() => setIsSignup((s) => !s)}
                    className="text-purple-700 font-medium hover:underline"
                  >
                    {isSignup ? "Sign In" : "Sign Up"}
                  </button>
                </p>
              )}

              <p className="text-sm">
                <button
                  onClick={() => {
                    setIsAdmin((a) => !a);
                    setIsSignup(false);
                  }}
                  className="text-orange-600 hover:underline"
                >
                  {isAdmin ? "← Back to User Login" : "Login as Admin"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          role="dialog"
          aria-modal="true"
          aria-label="Forgot password dialog"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setForgotModalOpen(false)}
            aria-hidden="true"
          />

          {/* Modal panel */}
          <div
            ref={forgotModalRef}
            className="relative w-full max-w-md bg-white rounded-xl shadow-lg p-6 z-10"
          >
            <h3 className="text-lg font-semibold mb-3">Forgot Password</h3>
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <label htmlFor="forgot-email" className="sr-only">
                Enter your email
              </label>
              <input
                id="forgot-email"
                type="email"
                placeholder="Enter your email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-200 focus:ring-2 focus:ring-emerald-300 outline-none text-sm"
              />
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setForgotModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loadingForgot}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 text-white rounded-lg text-sm"
                >
                  {loadingForgot ? "Sending..." : "Send Reset Link"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
