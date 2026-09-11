import { useEffect } from "react";
import { useDispatch } from "react-redux";
import AppRoutes from "@/routes";
import { finishAuthInitialization, logout, restoreAuth } from "@/features/auth";
import { api } from "@/services/api";

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const handleAuthLogout = () => dispatch(logout());

    window.addEventListener("auth:logout", handleAuthLogout);

    const token = localStorage.getItem("auth_token") || localStorage.getItem("access_token");
    if (!token) {
      dispatch(finishAuthInitialization());
      return () => window.removeEventListener("auth:logout", handleAuthLogout);
    }

    let isMounted = true;

    api
      .getCurrentUser()
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

  return <AppRoutes />;
}
