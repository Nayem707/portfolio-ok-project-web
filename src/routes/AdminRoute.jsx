import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectAuth } from "@/store/slices/authSlice";
import { ROLES } from "@/constants";

/**
 * Guards admin-only routes. Requires authentication AND the ADMIN role.
 * Non-admins are redirected to the storefront.
 */
export default function AdminRoute({ children }) {
  const { isAuthenticated, user } = useSelector(selectAuth);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (user?.role !== ROLES.ADMIN) {
    return <Navigate to="/" replace />;
  }
  return children;
}
