import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import AppRoutes from "@/routes";
import {
  finishAuthInitialization,
  logout,
  restoreAuth,
  selectAuth,
} from "@/features/auth";
import { hydrateCart, resetCartState } from "@/features/cart";
import { fetchWishlist, resetWishlistState } from "@/features/wishlist";
import { clearMyOrderState } from "@/features/orders";
import { fetchSettings } from "@/features/settings";
import { api } from "@/services/api";

export default function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, initialized } = useSelector(selectAuth);

  useEffect(() => {
    dispatch(hydrateCart());
    dispatch(fetchSettings());
  }, [dispatch]);


  useEffect(() => {
    const handleAuthLogout = () => {
      dispatch(logout());
      dispatch(resetCartState());
      dispatch(resetWishlistState());
      dispatch(clearMyOrderState());
    };

    window.addEventListener("auth:logout", handleAuthLogout);

    const token =
      localStorage.getItem("auth_token") ||
      localStorage.getItem("access_token");
    if (!token) {
      dispatch(finishAuthInitialization());
      return () => window.removeEventListener("auth:logout", handleAuthLogout);
    }

    let isMounted = true;

    api
      .getMyProfile()
      .then((user) => {
        if (isMounted) {
          dispatch(restoreAuth({ user }));
        }
      })
      .catch(() => {
        if (isMounted) {
          dispatch(logout());
        }
      })
      .finally(() => {
        if (isMounted) {
          dispatch(finishAuthInitialization());
        }
      });

    return () => {
      isMounted = false;
      window.removeEventListener("auth:logout", handleAuthLogout);
    };
  }, [dispatch]);

  useEffect(() => {
    if (!initialized || !isAuthenticated) return;
    dispatch(fetchWishlist());
  }, [dispatch, initialized, isAuthenticated]);

  return <AppRoutes />;
}
