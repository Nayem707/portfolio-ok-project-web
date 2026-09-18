import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "@/services/baseApi";
import authReducer from "@/features/auth/auth.slice";
import cartReducer from "@/features/cart/cart.slice";
import wishlistReducer from "@/features/wishlist/wishlist.slice";
import uiReducer from "@/features/ui/ui.slice";
import productReducer from "@/features/products/products.slice";
import categoryReducer from "@/features/categories/categories.slice";
import colorReducer from "@/features/colors/colors.slice";
import sizeReducer from "@/features/sizes/sizes.slice";
import homePageReducer from "@/features/homepage/homepage.slice";
import orderReducer from "@/features/orders/orders.slice";
import usersReducer from "@/features/users/users.slice";
import dashboardReducer from "@/features/dashboard/dashboard.slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    ui: uiReducer,
    product: productReducer,
    category: categoryReducer,
    color: colorReducer,
    size: sizeReducer,
    homePage: homePageReducer,
    order: orderReducer,
    users: usersReducer,
    dashboard: dashboardReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});
