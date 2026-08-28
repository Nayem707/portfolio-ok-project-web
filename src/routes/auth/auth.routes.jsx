import { Route } from "react-router-dom";

import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import ForgotPassword from "@/pages/auth/ForgotPassword";

import { AUTH_PATHS } from "@/routes/auth/auth.paths";

/**
 * Authentication routes. Rendered inside AuthLayout.
 */
export const authRoutes = (
  <>
    <Route path={AUTH_PATHS.LOGIN} element={<Login />} />
    <Route path={AUTH_PATHS.REGISTER} element={<Register />} />
    <Route path={AUTH_PATHS.FORGOT_PASSWORD} element={<ForgotPassword />} />
  </>
);
