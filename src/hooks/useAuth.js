import { useSelector } from "react-redux";
import { selectAuth, selectIsAdmin } from "@/store/slices/authSlice";

export default function useAuth() {
  const { user, isAuthenticated, loading } = useSelector(selectAuth);
  const isAdmin = useSelector(selectIsAdmin);
  return { user, isAuthenticated, isAdmin, loading };
}
