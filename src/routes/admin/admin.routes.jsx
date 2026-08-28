import { Route } from "react-router-dom";

import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminProductList from "@/pages/admin/AdminProductList";
import AddProduct from "@/pages/admin/AddProduct";
import EditProduct from "@/pages/admin/EditProduct";
import AdminProductDetails from "@/pages/admin/AdminProductDetails";
import AdminCategoryList from "@/pages/admin/AdminCategoryList";
import AdminOrderList from "@/pages/admin/AdminOrderList";
import AdminOrderDetails from "@/pages/admin/AdminOrderDetails";
import AdminUserList from "@/pages/admin/AdminUserList";
import AdminUserDetails from "@/pages/admin/AdminUserDetails";
import AdminSettings from "@/pages/admin/AdminSettings";

import { ADMIN_PATHS } from "@/routes/admin/admin.paths";

/**
 * Admin routes. Rendered inside AdminLayout behind the AdminRoute guard.
 */
export const adminRoutes = (
  <>
    <Route index element={<AdminDashboard />} />
    <Route path={ADMIN_PATHS.PRODUCTS} element={<AdminProductList />} />
    <Route path={ADMIN_PATHS.PRODUCT_CREATE} element={<AddProduct />} />
    <Route
      path={ADMIN_PATHS.PRODUCT_DETAILS}
      element={<AdminProductDetails />}
    />
    <Route path={ADMIN_PATHS.PRODUCT_EDIT} element={<EditProduct />} />
    <Route path={ADMIN_PATHS.CATEGORIES} element={<AdminCategoryList />} />
    <Route path={ADMIN_PATHS.ORDERS} element={<AdminOrderList />} />
    <Route path={ADMIN_PATHS.ORDER_DETAILS} element={<AdminOrderDetails />} />
    <Route path={ADMIN_PATHS.USERS} element={<AdminUserList />} />
    <Route path={ADMIN_PATHS.USER_DETAILS} element={<AdminUserDetails />} />
    <Route path={ADMIN_PATHS.SETTINGS} element={<AdminSettings />} />
  </>
);
