import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

/**
 * RTK Query base API.
 * Endpoints are intentionally left empty for now — the UI runs on mock data.
 * When the backend is ready, inject endpoints via `baseApi.injectEndpoints`
 * (e.g. src/store/api/productApi.js) without touching the store setup.
 */
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL || "/api",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("auth_token");
      if (token) headers.set("authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Product", "Category", "Order", "User", "Cart", "Wishlist"],
  endpoints: () => ({}),
});
