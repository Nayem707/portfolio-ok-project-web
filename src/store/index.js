import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "@/store/api/baseApi";
import authReducer from "@/store/slices/authSlice";
import cartReducer from "@/store/slices/cartSlice";
import wishlistReducer from "@/store/slices/wishlistSlice";
import uiReducer from "@/store/slices/uiSlice";
import productReducer from "@/store/slices/productSlice";
import categoryReducer from "@/store/slices/categorySlice";
import orderReducer from "@/store/slices/orderSlice";

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
