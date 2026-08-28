import { Route } from "react-router-dom";

import AccountLayout from "@/layouts/AccountLayout";
import ProtectedRoute from "@/routes/guards/ProtectedRoute";

import Cart from "@/pages/user/Cart";
import Wishlist from "@/pages/user/Wishlist";
import Checkout from "@/pages/user/Checkout";
import DashboardOverview from "@/pages/user/DashboardOverview";
import Profile from "@/pages/user/Profile";
import Orders from "@/pages/user/Orders";
import OrderDetails from "@/pages/user/OrderDetails";
import Addresses from "@/pages/user/Addresses";
import AccountSettings from "@/pages/user/AccountSettings";

import { USER_PATHS } from "@/routes/user/user.paths";

/**
 * User / shopping routes. Rendered inside MainLayout.
 * The account section is nested under AccountLayout and protected.
 */
export const userRoutes = (
  <>
    <Route path={USER_PATHS.CART} element={<Cart />} />
    <Route path={USER_PATHS.WISHLIST} element={<Wishlist />} />
    <Route
      path={USER_PATHS.CHECKOUT}
      element={
        <ProtectedRoute>
          <Checkout />
        </ProtectedRoute>
      }
    />

    <Route
      path={USER_PATHS.ACCOUNT}
      element={
        <ProtectedRoute>
          <AccountLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<DashboardOverview />} />
      <Route path={USER_PATHS.ACCOUNT_PROFILE} element={<Profile />} />
      <Route path={USER_PATHS.ACCOUNT_ORDERS} element={<Orders />} />
      <Route
        path={USER_PATHS.ACCOUNT_ORDER_DETAILS}
        element={<OrderDetails />}
      />
      <Route path={USER_PATHS.ACCOUNT_ADDRESSES} element={<Addresses />} />
      <Route path={USER_PATHS.ACCOUNT_SETTINGS} element={<AccountSettings />} />
    </Route>
  </>
);
