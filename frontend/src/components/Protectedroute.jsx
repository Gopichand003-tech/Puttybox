// ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/Authcontext";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // While checking auth, you can show a loader
  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <p className="text-xl text-gray-700 dark:text-white">Loading...</p>
      </div>
    );
  }

  // If user is not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If logged in, render the children
  return children;
};

export default ProtectedRoute;
