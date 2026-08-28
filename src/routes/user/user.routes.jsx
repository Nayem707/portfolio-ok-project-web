import { Route } from "react-router-dom";

import AccountLayout from "@/layouts/AccountLayout";
import ProtectedRoute from "@/routes/guards/ProtectedRoute";

import CartView from "@/pages/user/CartView";
import WishlistView from "@/pages/user/WishlistView";
import CheckoutView from "@/pages/user/CheckoutView";
import DashboardOverviewView from "@/pages/user/DashboardOverviewView";
import ProfileView from "@/pages/user/ProfileView";
import OrdersView from "@/pages/user/OrdersView";
import OrderDetailsView from "@/pages/user/OrderDetailsView";
import AddressesView from "@/pages/user/AddressesView";
import AccountSettingsView from "@/pages/user/AccountSettingsView";

import { USER_PATHS } from "@/routes/user/user.paths";

/**
 * User / shopping routes. Rendered inside MainLayout.
 * The account section is nested under AccountLayout and protected.
 */
export const userRoutes = (
  <>
    <Route path={USER_PATHS.CART} element={<CartView />} />
    <Route path={USER_PATHS.WISHLIST} element={<WishlistView />} />
    <Route
      path={USER_PATHS.CHECKOUT}
      element={
        <ProtectedRoute>
          <CheckoutView />
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
      <Route index element={<DashboardOverviewView />} />
      <Route path={USER_PATHS.ACCOUNT_PROFILE} element={<ProfileView />} />
      <Route path={USER_PATHS.ACCOUNT_ORDERS} element={<OrdersView />} />
      <Route
        path={USER_PATHS.ACCOUNT_ORDER_DETAILS}
        element={<OrderDetailsView />}
      />
      <Route path={USER_PATHS.ACCOUNT_ADDRESSES} element={<AddressesView />} />
      <Route
        path={USER_PATHS.ACCOUNT_SETTINGS}
        element={<AccountSettingsView />}
      />
    </Route>
  </>
);
