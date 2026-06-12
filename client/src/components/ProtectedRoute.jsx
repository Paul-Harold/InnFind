import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth.js";

// Wraps a route that requires login. Pass adminOnly for admin pages.
function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
