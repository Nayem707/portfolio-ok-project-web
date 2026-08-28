import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectAuth } from "@/features/auth";

/**
 * Guards routes that require an authenticated user.
 * Uses frontend auth state for now; ready for real JWT/API auth later.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useSelector(selectAuth);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}
