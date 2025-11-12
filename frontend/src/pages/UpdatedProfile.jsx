import React, { useState, useEffect } from "react";
import { useAuth } from "../context/Authcontext";
import { Button } from "../components/ui/button";
import axios from "axios";
import { toast, Toaster } from "sonner";
import { useNavigate } from "react-router-dom";
import { Camera, User, Mail, Lock, ArrowLeft } from "lucide-react";

const UpdateProfile = () => {
  const { user, token, updateUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [profilePicFile, setProfilePicFile] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState(user?.profilePic || "");
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Preview selected image
  useEffect(() => {
    if (profilePicFile) {
      const reader = new FileReader();
      reader.onloadend = () => setProfilePicPreview(reader.result);
      reader.readAsDataURL(profilePicFile);
    } else {
      setProfilePicPreview(user?.profilePic || "");
    }
  }, [profilePicFile, user?.profilePic]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handlePasswordChange = (e) =>
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) setProfilePicFile(file);
  };

  // Submit profile info
  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("email", formData.email);
      if (profilePicFile) data.append("profilePic", profilePicFile);

     const res = await axios.put(
  `${import.meta.env.VITE_API_URL}/api/auth/update-profile`,
  data,
  {
    withCredentials: true, // ✅ send cookies
    headers: {
      "Content-Type": "multipart/form-data", // token not needed if cookie is enough
    },
  }
);

      updateUser(res.data);
      if (res.data.profilePic) setProfilePicPreview(res.data.profilePic);
      toast.success("Profile updated successfully ✅");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed ❌");
    } finally {
      setLoading(false);
    }
  };

  // Submit password change
  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error("New password and confirm password do not match ❌");
    }

    setPasswordLoading(true);
    try {
      await axios.put(
  `${import.meta.env.VITE_API_URL}/api/auth/change-password`,
  {
    oldPassword: passwordData.oldPassword,
    newPassword: passwordData.newPassword,
  },
  { withCredentials: true } // ✅ send cookie
);

      toast.success("Password updated successfully ✅");
      setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Password update failed ❌");
    } finally {
      setPasswordLoading(false);
    }
  };

  const profilePicUrl =
    profilePicPreview?.startsWith("http") || profilePicPreview?.startsWith("data:")
      ? profilePicPreview
      : profilePicPreview
      ? `${import.meta.env.VITE_API_URL}/${profilePicPreview}`
      : "https://via.placeholder.com/150";

  return (
     <div className="w-screen h-screen relative flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        loop
        muted
      >
        <source
          src="profilepage.mp4" // Replace with your video URL
          type="video/mp4"
        />
        Your browser does not support the video tag.
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/10 backdrop-blur-m"></div>

      <div className="relative z-10 flex flex-col md:flex-row gap-8 md:gap-12 items-start justify-center w-full max-w-6xl">
        {/* Left Box — Profile Info */}
        <div className="flex-1 bg-white/15 backdrop-blur-xl rounded-3xl shadow-2xl p-8 flex flex-col items-center border border-white/30">
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-green-500 shadow-lg cursor-pointer hover:scale-105 transition-transform mb-3">
            <img src={profilePicUrl} alt="Profile Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/40 transition">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleProfilePicChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Update Profile</h2>

          <form className="w-full space-y-4" onSubmit={handleSubmitProfile}>
            <div className="relative flex items-center">
              <User className="w-5 h-5 text-green-400 absolute left-3" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Full Name"
                required
                className="peer w-full pl-10 px-4 py-3 rounded-xl bg-white/80 border border-green-300 focus:border-green-600 outline-none text-gray-900"
              />
            </div>
            <div className="relative flex items-center">
              <Mail className="w-5 h-5 text-green-400 absolute left-3" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                required
                className="peer w-full pl-10 px-4 py-3 rounded-xl bg-white/80 border border-green-300 focus:border-green-600 outline-none text-gray-900"
              />
            </div>
            <Button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-green-500 to-green-700 text-white font-bold rounded-xl hover:scale-105 transform transition-shadow"
            >
              {loading ? "Updating..." : "Update Profile"}
            </Button>
          </form>
        </div>

        {/* Right Box — Change Password */}
        <div className="flex-1 bg-white/15 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/30">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Change Password</h2>
          <form className="w-full space-y-4" onSubmit={handleSubmitPassword}>
            {["oldPassword", "newPassword", "confirmPassword"].map((field, i) => (
              <div key={i} className="relative flex items-center">
                <Lock className="w-5 h-5 text-green-400 absolute left-3" />
                <input
                  type="password"
                  name={field}
                  value={passwordData[field]}
                  onChange={handlePasswordChange}
                  placeholder={
                    field === "oldPassword"
                      ? "Current Password"
                      : field === "newPassword"
                      ? "New Password"
                      : "Confirm Password"
                  }
                  required
                  className="peer w-full pl-10 px-4 py-3 rounded-xl bg-white/80 border border-green-300 focus:border-green-600 outline-none text-gray-900"
                />
              </div>
            ))}
            <Button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-green-500 to-green-700 text-white font-bold rounded-xl hover:scale-105 transform transition-shadow"
            >
              {passwordLoading ? "Updating..." : "Change Password"}
            </Button>
          </form>
        </div>
      </div>

      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-full shadow-md hover:bg-white/40 transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>
    </div>
  );
};

export default UpdateProfile;
