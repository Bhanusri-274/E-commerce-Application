import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/common/Loader";

export const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loader fullScreen />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return <Outlet />;
};

export const AdminRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return <Loader fullScreen />;
  if (!user) return <Navigate to="/admin/login" replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;
  return <Outlet />;
};

export const GuestRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return <Loader fullScreen />;
  if (user) return <Navigate to="/" replace />;
  return <Outlet />;
};
