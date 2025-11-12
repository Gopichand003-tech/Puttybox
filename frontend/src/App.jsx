// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/Authcontext";
import { Suspense, lazy } from "react";
import { Toaster } from "sonner";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import Footer from "./components/Footer";

// Lazy load pages
const Login = lazy(() => import("./pages/Loginpage"));
const Home = lazy(() => import("./pages/home"));
const MealPlansPage = lazy(() => import("./pages/MealPlansPage"));
const ProfilePage = lazy(() => import("./pages/Profilepage"));
const UpdateProfile = lazy(() => import("./pages/UpdatedProfile"));
const Customize = lazy(() => import("./pages/Customize"));
const SelectMealsPage = lazy(() => import("./pages/SelectMealsPage"));
const HowItWorks = lazy(() => import("./pages/howitworks"));
const Dashboard = lazy(() => import("./pages/dashboard"));
const QuickOrder = lazy(() => import("./pages/Quickorder"));
const AdminDashboard = lazy(() => import("./pages/adminDashboard"));
const OrderHistoryPage = lazy(() => import("./pages/OrderHistoryPage"));


// Protected Route
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <p className="text-xl text-gray-700 dark:text-white">Loading...</p>
      </div>
    );
  if (!user) return <Navigate to="/" replace />;
  return children;
};

// Dashboard
const DashboardPage = () => {
  const { user } = useAuth();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold mb-4 text-green-700">
        Welcome, {user?.name || "User"}!
      </h1>
      <p className="text-gray-600">This is your dashboard. Manage your plans here.</p>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Toaster richColors duration={5000} />
      <BrowserRouter>
        <Suspense
          fallback={
            <div className="w-screen h-screen flex items-center justify-center">
              <p className="text-xl text-gray-700 dark:text-white">Loading page...</p>
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<Login />} />
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mealplan/:type"
              element={
                <ProtectedRoute>
                  <MealPlansPage />
                </ProtectedRoute>
              }
            />
            <Route
  path="/mealplan"
  element={
    <ProtectedRoute>
      <MealPlansPage />
    </ProtectedRoute>
  }
/>
            <Route
              path="/select-meals/:planType"
              element={
                <ProtectedRoute>
                  <SelectMealsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customize"
              element={
                <ProtectedRoute>
                  <Customize />
                </ProtectedRoute>
              }
            />
            <Route
              path="/quickorder"
              element={
                <ProtectedRoute>
                  <QuickOrder />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/update-profile"
              element={
                <ProtectedRoute>
                  <UpdateProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/how-it-works"
              element={
                <ProtectedRoute>
                  <HowItWorks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/Order-history"
              element={
                <ProtectedRoute>
                  <OrderHistoryPage />
                </ProtectedRoute>
              }
            />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            <Route path="/footer" element={<Footer />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
