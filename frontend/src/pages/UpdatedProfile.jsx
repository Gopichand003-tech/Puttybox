import React, { useState, useEffect } from "react";
import { useAuth } from "../context/Authcontext";
import { Button } from "../components/ui/button";
import axios from "axios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Camera, User, Mail, Lock, ArrowLeft } from "lucide-react";

const UpdateProfile = () => {
  const { user, updateUser } = useAuth();
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

  useEffect(() => {
    if (profilePicFile) {
      const reader = new FileReader();
      reader.onloadend = () => setProfilePicPreview(reader.result);
      reader.readAsDataURL(profilePicFile);
    }
  }, [profilePicFile]);

  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("email", formData.email);
      if (profilePicFile) data.append("profilePic", profilePicFile);

      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/update/update-profile`,
        data,
        { withCredentials: true }
      );

      updateUser(res.data);
      toast.success("Profile updated successfully ✅");
    } catch (err) {
      toast.error("Update failed ❌");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword)
      return toast.error("Passwords do not match");

    setPasswordLoading(true);
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/auth/change-password`,
        {
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword,
        },
        { withCredentials: true }
      );
      toast.success("Password updated ✅");
      setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch {
      toast.error("Password update failed ❌");
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
    <div className="min-h-screen w-full relative flex items-center justify-center px-4 sm:px-6 overflow-y-auto">
      {/* Video Background */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        loop
        muted
      >
        <source src="profilepage.mp4" type="video/mp4" />
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-6xl flex flex-col md:flex-row gap-6 md:gap-10 py-10">
        
        {/* Profile Box */}
        <div className="flex-1 bg-white/15 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/30">
          <div className="flex flex-col items-center">
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-green-500 mb-4">
              <img src={profilePicUrl} className="w-full h-full object-cover" />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setProfilePicFile(e.target.files[0])}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100">
                <Camera className="text-white" />
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">
              Update Profile
            </h2>
          </div>

          <form onSubmit={handleSubmitProfile} className="space-y-4">
            <Input icon={User} value={formData.name} onChange={(e)=>setFormData({...formData,name:e.target.value})} placeholder="Full Name"/>
            <Input icon={Mail} value={formData.email} onChange={(e)=>setFormData({...formData,email:e.target.value})} placeholder="Email"/>
            <Button className="w-full">{loading ? "Updating..." : "Update Profile"}</Button>
          </form>
        </div>

        {/* Password Box */}
        <div className="flex-1 bg-white/15 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/30">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 text-center">
            Change Password
          </h2>

          <form onSubmit={handleSubmitPassword} className="space-y-4">
            <PasswordInput value={passwordData.oldPassword} onChange={(e)=>setPasswordData({...passwordData,oldPassword:e.target.value})} placeholder="Current Password"/>
            <PasswordInput value={passwordData.newPassword} onChange={(e)=>setPasswordData({...passwordData,newPassword:e.target.value})} placeholder="New Password"/>
            <PasswordInput value={passwordData.confirmPassword} onChange={(e)=>setPasswordData({...passwordData,confirmPassword:e.target.value})} placeholder="Confirm Password"/>
            <Button className="w-full">{passwordLoading ? "Updating..." : "Change Password"}</Button>
          </form>
        </div>
      </div>

      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="fixed top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-full"
      >
        <ArrowLeft size={16} /> Back
      </button>
    </div>
  );
};

/* Small helper components */
const Input = ({ icon: Icon, ...props }) => (
  <div className="relative">
    <Icon className="absolute left-3 top-3 text-green-500" size={18} />
    <input
      {...props}
      required
      className="w-full pl-10 py-3 rounded-xl bg-white/80 border border-green-300"
    />
  </div>
);

const PasswordInput = (props) => (
  <Input {...props} icon={Lock} type="password" />
);

export default UpdateProfile;
