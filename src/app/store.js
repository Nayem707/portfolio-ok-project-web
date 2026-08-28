import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "@/store/baseApi";
import authReducer from "@/store/auth/auth.slice";
import cartReducer from "@/store/cart/cart.slice";
import wishlistReducer from "@/store/wishlist/wishlist.slice";
import uiReducer from "@/store/ui/ui.slice";
import productReducer from "@/store/products/products.slice";
import categoryReducer from "@/store/categories/categories.slice";
import orderReducer from "@/store/orders/orders.slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    ui: uiReducer,
    product: productReducer,
    category: categoryReducer,
    order: orderReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});
