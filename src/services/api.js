import axiosInstance from "./axiosInstance";

const getData = (response) => response?.data?.data ?? response?.data ?? [];

export const api = {
  login: async (payload) => {
    const response = await axiosInstance.post("/auth/login", payload);
    return getData(response);
  },

  register: async (payload) => {
    const response = await axiosInstance.post("/auth/register", payload);
    return getData(response);
  },

  refreshToken: async (refreshToken) => {
    const response = await axiosInstance.post("/auth/refresh", {
      refreshToken,
    });
    return getData(response);
  },

  logout: async (refreshToken) => {
    const response = await axiosInstance.post("/auth/logout", { refreshToken });
    return getData(response);
  },

  getCurrentUser: async () => {
    const response = await axiosInstance.get("/auth/me");
    return getData(response);
  },

  getMyProfile: async () => {
    const response = await axiosInstance.get("/users/me");
    return getData(response);
  },

  updateMyProfile: async (payload) => {
    const response = await axiosInstance.patch("/users/me", payload);
    return getData(response);
  },

  changeMyPassword: async (payload) => {
    const response = await axiosInstance.patch("/users/me/password", payload);
    return getData(response);
  },

  listMyAddresses: async () => {
    const response = await axiosInstance.get("/users/me/addresses");
    return getData(response);
  },

  createMyAddress: async (payload) => {
    const response = await axiosInstance.post("/users/me/addresses", payload);
    return getData(response);
  },

  updateMyAddress: async (addressId, payload) => {
    const response = await axiosInstance.patch(
      `/users/me/addresses/${addressId}`,
      payload,
    );
    return getData(response);
  },

  deleteMyAddress: async (addressId) => {
    const response = await axiosInstance.delete(
      `/users/me/addresses/${addressId}`,
    );
    return getData(response);
  },

  getCart: async () => {
    const response = await axiosInstance.get("/cart");
    return getData(response);
  },

  addCartItem: async (payload) => {
    const response = await axiosInstance.post("/cart/items", payload);
    return getData(response);
  },

  updateCartItem: async (cartItemId, payload) => {
    const response = await axiosInstance.patch(
      `/cart/items/${cartItemId}`,
      payload,
    );
    return getData(response);
  },

  removeCartItem: async (cartItemId) => {
    const response = await axiosInstance.delete(`/cart/items/${cartItemId}`);
    return getData(response);
  },

  clearCart: async () => {
    const response = await axiosInstance.delete("/cart");
    return getData(response);
  },

  getWishlist: async () => {
    const response = await axiosInstance.get("/wishlist");
    return getData(response);
  },

  addToWishlist: async (productId) => {
    const response = await axiosInstance.post(`/wishlist/${productId}`);
    return getData(response);
  },

  removeFromWishlist: async (productId) => {
    const response = await axiosInstance.delete(`/wishlist/${productId}`);
    return getData(response);
  },

  checkout: async (payload) => {
    const response = await axiosInstance.post("/orders/checkout", payload);
    return getData(response);
  },

  getMyOrders: async (params = {}) => {
    const response = await axiosInstance.get("/orders/my-orders", { params });
    return response?.data ?? { data: [], meta: null };
  },

  getMyOrderById: async (orderId) => {
    const response = await axiosInstance.get(`/orders/${orderId}`);
    return getData(response);
  },

  listProductReviews: async (productId) => {
    const response = await axiosInstance.get(`/products/${productId}/reviews`);
    return getData(response);
  },

  createProductReview: async (productId, payload) => {
    const response = await axiosInstance.post(
      `/products/${productId}/reviews`,
      payload,
    );
    return getData(response);
  },

  updateMyReview: async (reviewId, payload) => {
    const response = await axiosInstance.patch(`/reviews/${reviewId}`, payload);
    return getData(response);
  },

  deleteMyReview: async (reviewId) => {
    const response = await axiosInstance.delete(`/reviews/${reviewId}`);
    return getData(response);
  },

  getProducts: async (params = {}) => {
    const response = await axiosInstance.get("/products", { params });
    return response?.data ?? { data: [], meta: null };
  },

  getCategories: async () => {
    const response = await axiosInstance.get("/categories");
    return getData(response);
  },

  getHomepage: async () => {
    const response = await axiosInstance.get("/homepage");
    return getData(response);
  },
};
