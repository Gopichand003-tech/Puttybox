import React from "react";
import { useAuth } from "../context/Authcontext";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Edit3,User,Mail } from "lucide-react"; // ✅ Lucide icon import

const ProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-green-200 to-white">
        <p className="text-gray-700 text-xl font-semibold">No user logged in.</p>
      </div>
    );
  }

  const profilePicUrl =
    user.profilePic?.startsWith("http") || user.profilePic?.startsWith("data:")
      ? user.profilePic
      : user.profilePic
      ? `${import.meta.env.VITE_API_URL}/${user.profilePic}`
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

      {/* Glass Card */}
      <div className="relative z-10 w-full max-w-md bg-white/15 backdrop-blur-2xl rounded-3xl shadow-2xl p-10 flex flex-col items-center space-y-6 border border-white/30">
        <div className="relative w-36 h-36 rounded-full overflow-hidden border-4 border-green-500 shadow-lg">
          <img
            src={profilePicUrl}
            alt="Profile"
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 rounded-full"></div>
        </div>

<h2 className="flex items-center gap-2 text-3xl font-extrabold drop-shadow-lg">
  <User className="w-7 h-7 text-blue-700" />
  <span className="text-green-800">{user.name.split(" ")[0]}</span>
  <span className="text-black">{user.name.split(" ").slice(1).join(" ")}</span>
</h2>
<p className="flex items-center gap-2 text-lg tracking-wide">
  <Mail className="w-6 h-6 text-purple-700" />
  <span className="text-gray-900">{user.email}</span>
</p>


      

        <Button
          onClick={() => navigate("/update-profile")}
          className="w-full py-3 bg-gradient-to-r from-green-500 to-green-700 text-white font-bold rounded-xl hover:shadow-lg hover:scale-105 transform transition duration-300 flex items-center justify-center gap-2"
        >
          <Edit3 className="w-5 h-5" />
          Update Profile
        </Button>

        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-6 py-2 bg-white/30 text-white font-semibold rounded-full shadow-md hover:bg-white/50 transition-all duration-300"
        >
          ← Back
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
