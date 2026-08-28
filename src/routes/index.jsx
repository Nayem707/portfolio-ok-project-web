import { Routes, Route } from "react-router-dom";
import ScrollToTop from "@/components/navigation/ScrollToTop";

// Layouts
import MainLayout from "@/layouts/MainLayout";
import AuthLayout from "@/layouts/AuthLayout";
import AdminLayout from "@/layouts/AdminLayout";

// Guards
import AdminRoute from "@/routes/guards/AdminRoute";

// Route modules
import { publicRoutes, notFoundRoute } from "@/routes/public/public.routes";
import { authRoutes } from "@/routes/auth/auth.routes";
import { userRoutes } from "@/routes/user/user.routes";
import { adminRoutes } from "@/routes/admin/admin.routes";
import { ADMIN_PATHS } from "@/routes/admin/admin.paths";

/**
 * Central router. Composes public, auth, user and admin route modules
 * under their respective layouts.
 */
export default function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Storefront: public + user routes share MainLayout */}
        <Route element={<MainLayout />}>
          {publicRoutes}
          {userRoutes}
        </Route>

        {/* Auth */}
        <Route element={<AuthLayout />}>{authRoutes}</Route>

        {/* Admin */}
        <Route
          path={ADMIN_PATHS.ROOT}
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          {adminRoutes}
        </Route>

        {/* 404 */}
        <Route element={<MainLayout />}>{notFoundRoute}</Route>
      </Routes>
    </>
  );
}
