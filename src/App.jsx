import { Routes, Route } from "react-router-dom";
import ScrollToTop from "@/components/layout/ScrollToTop";

// Layouts
import MainLayout from "@/layouts/MainLayout";
import AuthLayout from "@/layouts/AuthLayout";
import AccountLayout from "@/layouts/AccountLayout";
import AdminLayout from "@/layouts/AdminLayout";

// Guards
import ProtectedRoute from "@/routes/ProtectedRoute";
import AdminRoute from "@/routes/AdminRoute";

// Public pages
import Home from "@/pages/public/Home";
import Products from "@/pages/public/Products";
import ProductDetails from "@/pages/public/ProductDetails";
import Categories from "@/pages/public/Categories";
import NotFound from "@/pages/public/NotFound";

// Auth pages
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import ForgotPassword from "@/pages/auth/ForgotPassword";

// User/shopping pages
import Cart from "@/pages/user/Cart";
import Wishlist from "@/pages/user/Wishlist";
import Checkout from "@/pages/user/Checkout";
import DashboardOverview from "@/pages/user/DashboardOverview";
import Profile from "@/pages/user/Profile";
import Orders from "@/pages/user/Orders";
import OrderDetails from "@/pages/user/OrderDetails";
import Addresses from "@/pages/user/Addresses";
import AccountSettings from "@/pages/user/AccountSettings";

// Admin pages
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

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Storefront */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />

          {/* User account */}
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <AccountLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardOverview />} />
            <Route path="profile" element={<Profile />} />
            <Route path="orders" element={<Orders />} />
            <Route path="orders/:id" element={<OrderDetails />} />
            <Route path="addresses" element={<Addresses />} />
            <Route path="settings" element={<AccountSettings />} />
          </Route>
        </Route>

        {/* Auth */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProductList />} />
          <Route path="products/create" element={<AddProduct />} />
          <Route path="products/:id" element={<AdminProductDetails />} />
          <Route path="products/:id/edit" element={<EditProduct />} />
          <Route path="categories" element={<AdminCategoryList />} />
          <Route path="orders" element={<AdminOrderList />} />
          <Route path="orders/:id" element={<AdminOrderDetails />} />
          <Route path="users" element={<AdminUserList />} />
          <Route path="users/:id" element={<AdminUserDetails />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* 404 */}
        <Route element={<MainLayout />}>
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}
