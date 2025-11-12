import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, Toaster } from "sonner";

export default function ResetPasswordPage() {
  const { token } = useParams(); // token from URL
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword) return toast.error("Enter new password");
    setLoading(true);
    try {
      await axios.post(`/api/auth/reset-password/${token}`, { newPassword });
      toast.success("Password reset successful ✅");
      navigate("/"); // redirect to login
    } catch (err) {
      toast.error(err.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Toaster position="top-center" richColors />
      <div className="w-full max-w-md bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-center mb-4 text-purple-700">Reset Password</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-lg bg-gray-100 border focus:ring-2 focus:ring-purple-500 outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-400 text-white font-semibold rounded-lg hover:opacity-90"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
