import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { GoogleLogin } from "@react-oauth/google";
import { toast, Toaster } from "sonner";
import { useAuth } from "../context/Authcontext";
import axios from "axios";

export default function LoginPage() {
  const [isSignup, setIsSignup] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); // 🔹 NEW — track admin mode
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

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // ------------------------------
  // 🔹 Login / Signup / Admin Login
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
      { withCredentials: true } // 👈 important for cookies
    );

    toast.success("Admin login successful ✅");
    // Wait briefly to ensure the cookie is stored
setTimeout(() => {
  navigate("/admin-dashboard");
}, 1000);

  } catch (err) {
    toast.error(err.response?.data?.message || "Admin login failed ❌");
  }

      } else if (isSignup) {
        // ✅ User Signup
        await axios.post("/api/auth/register", formData);
        await loginUser(formData.email, formData.password);
        toast.success("Signup Successful ✅");
        navigate("/home");

      } else {
        // ✅ User Login
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
  // 🔹 Google Login
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
  // 🔹 Forgot Password
  // ------------------------------
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setLoadingForgot(true);
    try {
      await axios.post("/api/auth/forgot-password", { email: forgotEmail });
      toast.success("Password reset link sent ✅");
      setForgotModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Error sending reset link");
    } finally {
      setLoadingForgot(false);
    }
  };

  // ------------------------------
  // 🔹 UI
  // ------------------------------
  return (
    <div className="w-screen h-screen flex items-center justify-center relative bg-gray-50 dark:bg-gray-900">
      <Toaster position="top-center" richColors />

      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-0 right-0 w-[28rem] h-[28rem] bg-blue-500/20 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>

      <div className="w-full max-w-8xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-2xl rounded-3xl shadow-xl flex flex-col md:flex-row overflow-hidden border border-white/20">

        {/* Left Section (Video) */}
        <div className="hidden md:flex w-3/5 relative h-screen overflow-hidden">
          <video
            src="/puttylogin.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute top-1/2 left-1/2 text-center -translate-x-1/2 -translate-y-1/2 z-10 px-4">
            <h1 className="text-5xl md:text-6xl font-bold text-white">
              {isAdmin ? "Admin Portal" : isSignup ? "Join Us" : "Welcome Back"}
            </h1>
            <p className="mt-4 text-gray-100 text-lg md:text-xl">
              {isAdmin
                ? "Manage orders and oversee operations"
                : isSignup
                ? "Sign up to unlock premium features."
                : "Log in to access your dashboard."}
            </p>
          </div>
        </div>

        {/* Right Section (Form) */}
        <div className="flex-1 flex items-center justify-center min-h-screen p-8 sm:p-12">
          <div className="w-full max-w-lg bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-xl shadow-lg p-8 space-y-6">

            {/* Logo */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <img src="/puttylogo1.png" alt="PUTTYBOX" className="w-20 h-18 object-contain" />
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-green-600 to-black bg-clip-text text-transparent">
                PUTTYBOX
              </h1>
            </div>

            <h2 className="text-3xl font-bold text-center text-blue-900 dark:text-white">
              {isAdmin ? "Admin Login" : isSignup ? "Create Account" : "Sign In"}
            </h2>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {!isAdmin && isSignup && (
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-gray-100/60 dark:bg-gray-800/60 border border-gray-300/40 focus:ring-4 focus:ring-purple-500 outline-none"
                />
              )}
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg bg-gray-100/60 dark:bg-gray-800/60 border border-gray-300/40 focus:ring-4 focus:ring-purple-500 outline-none"
              />
              <div className="flex items-center gap-2">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-gray-100/80 dark:bg-gray-800/80 shadow-sm hover:bg-gray-100 focus:ring-4 focus:ring-purple-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-500 hover:text-gray-800"
                >
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-400 text-white font-semibold rounded-lg hover:opacity-90"
              >
                {loading
                  ? "Processing..."
                  : isAdmin
                  ? "Admin Login"
                  : isSignup
                  ? "Sign Up"
                  : "Login"}
              </button>

              {!isAdmin && !isSignup && (
                <p
                  className="text-sm text-purple-500 hover:underline cursor-pointer text-center"
                  onClick={() => setForgotModalOpen(true)}
                >
                  Forgot Password?
                </p>
              )}

              {!isAdmin && (
                <div className="flex justify-center mt-4">
                  <GoogleLogin
                    onSuccess={handleGoogleLogin}
                    onError={() => toast.error("Google login failed")}
                  />
                </div>
              )}
            </form>

            {/* Switch Modes */}
            <div className="text-center text-blue-800 dark:text-gray-300 mt-4 text-base space-y-2">
              {!isAdmin && (
                <p>
                  {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
                  <span
                    onClick={() => setIsSignup(!isSignup)}
                    className="text-purple-900 hover:underline cursor-pointer font-medium"
                  >
                    {isSignup ? "Sign In" : "Sign Up"}
                  </span>
                </p>
              )}

              <p
                onClick={() => {
                  setIsAdmin(!isAdmin);
                  setIsSignup(false);
                }}
                className="text-sm text-orange-600 hover:underline cursor-pointer"
              >
                {isAdmin ? "← Back to User Login" : "Login as Admin"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="w-full max-w-md p-6 bg-white rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Forgot Password</h3>
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <input
                type="email"
                placeholder="Enter your email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg bg-gray-100 border"
              />
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setForgotModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-gray-400 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loadingForgot}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-400 text-white rounded-lg hover:opacity-90"
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
