import { Route } from "react-router-dom";

import LoginView from "@/pages/auth/LoginView";
import RegisterView from "@/pages/auth/RegisterView";
import ForgotPasswordView from "@/pages/auth/ForgotPasswordView";

import { AUTH_PATHS } from "@/routes/auth/auth.paths";

/**
 * Authentication routes. Rendered inside AuthLayout.
 */
export const authRoutes = (
  <>
    <Route path={AUTH_PATHS.LOGIN} element={<LoginView />} />
    <Route path={AUTH_PATHS.REGISTER} element={<RegisterView />} />
    <Route path={AUTH_PATHS.FORGOT_PASSWORD} element={<ForgotPasswordView />} />
  </>
);
