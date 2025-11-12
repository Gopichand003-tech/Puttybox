// components/ProtectedRoute.jsx
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

axios.defaults.withCredentials = true;

export default function ProtectedRoute({ children }) {
  const [isAuth, setIsAuth] = useState(null);

  useEffect(() => {
    const verify = async () => {
      try {
        const { data } = await axios.get(
  "http://localhost:5000/api/admin/check",
  { withCredentials: true } // 👈 ensures cookie is sent
);

        setIsAuth(data.authenticated);
      } catch {
        setIsAuth(false);
      }
    };
    verify();
  }, []);

  if (isAuth === null)
  return (
    <div className="flex h-screen items-center justify-center text-gray-500">
      Checking authentication...
    </div>
  );          // wait for check
  return isAuth ? children : <Navigate to="/" replace />;
}
