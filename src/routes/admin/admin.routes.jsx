import { Route } from "react-router-dom";

import AdminDashboardView from "@/pages/admin/AdminDashboardView";
import AdminProductListView from "@/pages/admin/AdminProductListView";
import AddProductView from "@/pages/admin/AddProductView";
import EditProductView from "@/pages/admin/EditProductView";
import AdminProductDetailsView from "@/pages/admin/AdminProductDetailsView";
import AdminCategoryListView from "@/pages/admin/AdminCategoryListView";
import AdminColorListView from "@/pages/admin/AdminColorListView";
import AdminSizeListView from "@/pages/admin/AdminSizeListView";
import ProductAttributesView from "@/pages/admin/ProductAttributesView";
import HomePageManagementView from "@/pages/admin/HomePageManagementView";
import AdminOrderListView from "@/pages/admin/AdminOrderListView";
import AdminOrderDetailsView from "@/pages/admin/AdminOrderDetailsView";
import AdminUserListView from "@/pages/admin/AdminUserListView";
import AdminUserDetailsView from "@/pages/admin/AdminUserDetailsView";
import AdminSettingsView from "@/pages/admin/AdminSettingsView";

import { ADMIN_PATHS } from "@/routes/admin/admin.paths";

/**
 * Admin routes. Rendered inside AdminLayout behind the AdminRoute guard.
 */
export const adminRoutes = (
  <>
    <Route index element={<AdminDashboardView />} />
    <Route path={ADMIN_PATHS.PRODUCTS} element={<AdminProductListView />} />
    <Route path={ADMIN_PATHS.PRODUCT_CREATE} element={<AddProductView />} />
    <Route
      path={ADMIN_PATHS.PRODUCT_DETAILS}
      element={<AdminProductDetailsView />}
    />
    <Route path={ADMIN_PATHS.PRODUCT_EDIT} element={<EditProductView />} />
    <Route path={ADMIN_PATHS.CATEGORIES} element={<AdminCategoryListView />} />
    <Route path={ADMIN_PATHS.COLORS} element={<AdminColorListView />} />
    <Route path={ADMIN_PATHS.SIZES} element={<AdminSizeListView />} />
    <Route path={ADMIN_PATHS.ATTRIBUTES} element={<ProductAttributesView />} />
    <Route
      path={ADMIN_PATHS.ATTRIBUTES_CATEGORIES}
      element={<AdminCategoryListView />}
    />
    <Route
      path={ADMIN_PATHS.ATTRIBUTES_COLORS}
      element={<AdminColorListView />}
    />
    <Route
      path={ADMIN_PATHS.ATTRIBUTES_SIZES}
      element={<AdminSizeListView />}
    />
    <Route
      path={ADMIN_PATHS.HOME_PAGE_MANAGEMENT}
      element={<HomePageManagementView />}
    />
    <Route path={ADMIN_PATHS.ORDERS} element={<AdminOrderListView />} />
    <Route
      path={ADMIN_PATHS.ORDER_DETAILS}
      element={<AdminOrderDetailsView />}
    />
    <Route path={ADMIN_PATHS.USERS} element={<AdminUserListView />} />
    <Route path={ADMIN_PATHS.USER_DETAILS} element={<AdminUserDetailsView />} />
    <Route path={ADMIN_PATHS.SETTINGS} element={<AdminSettingsView />} />
  </>
);
