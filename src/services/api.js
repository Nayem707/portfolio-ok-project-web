import axiosInstance from "./axiosInstance";

const getData = (response) => response?.data?.data ?? response?.data ?? [];
const asArray = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.categories)) return value.categories;
  return [];
};

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

  uploadMyAvatar: async (file) => {
    const formData = new FormData();
    formData.append("avatar", file);
    const response = await axiosInstance.post("/users/me/avatar", formData, {
      timeout: 30000,
    });
    return getData(response);
  },

  removeMyAvatar: async () => {
    const response = await axiosInstance.delete("/users/me/avatar");
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

  getUsers: async (params = {}) => {
    const response = await axiosInstance.get("/users", { params });
    return response?.data ?? { data: [], meta: null };
  },

  getUserById: async (userId) => {
    const response = await axiosInstance.get(`/users/${userId}`);
    return getData(response);
  },

  updateUserStatus: async (userId, status) => {
    const response = await axiosInstance.patch(`/users/${userId}/status`, {
      status,
    });
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

  getOrders: async (params = {}) => {
    const response = await axiosInstance.get("/orders", { params });
    return response?.data ?? { data: [], meta: null };
  },

  getMyOrders: async (params = {}) => {
    const response = await axiosInstance.get("/orders/my-orders", { params });
    return response?.data ?? { data: [], meta: null };
  },

  getMyOrderById: async (orderId) => {
    const response = await axiosInstance.get(`/orders/${orderId}`);
    return getData(response);
  },

  getOrderById: async (orderId) => {
    const response = await axiosInstance.get(`/orders/${orderId}`);
    return getData(response);
  },

  updateOrderStatus: async (orderId, payload) => {
    const response = await axiosInstance.patch(
      `/orders/${orderId}/status`,
      payload,
    );
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

  getFeaturedProducts: async (limit = 8) => {
    const response = await axiosInstance.get("/products/featured", {
      params: { limit },
    });
    return getData(response);
  },

  getPopularProducts: async (limit = 8) => {
    const response = await axiosInstance.get("/products/popular", {
      params: { limit },
    });
    return getData(response);
  },

  getNewArrivals: async (limit = 8) => {
    const response = await axiosInstance.get("/products/new-arrivals", {
      params: { limit },
    });
    return getData(response);
  },

  getProductByIdOrSlug: async (idOrSlug) => {
    const response = await axiosInstance.get(`/products/${idOrSlug}`);
    return getData(response);
  },

  createProduct: async (payload) => {
    const response = await axiosInstance.post("/products", payload);
    return getData(response);
  },

  updateProduct: async (productId, payload) => {
    const response = await axiosInstance.patch(`/products/${productId}`, payload);
    return getData(response);
  },

  deleteProduct: async (productId) => {
    const response = await axiosInstance.delete(`/products/${productId}`);
    return getData(response);
  },

  getPublicProductReviews: async (productId) => {
    const response = await axiosInstance.get(`/products/${productId}/reviews`);
    return getData(response);
  },

  getCategories: async (params = {}) => {
    const response = await axiosInstance.get("/categories", { params });
    return asArray(getData(response));
  },

  getCategoryById: async (categoryId) => {
    const response = await axiosInstance.get(`/categories/${categoryId}`);
    return getData(response);
  },

  createCategory: async (payload) => {
    const response = await axiosInstance.post("/categories", payload);
    return getData(response);
  },

  updateCategory: async (categoryId, payload) => {
    const response = await axiosInstance.patch(
      `/categories/${categoryId}`,
      payload,
    );
    return getData(response);
  },

  deleteCategory: async (categoryId) => {
    const response = await axiosInstance.delete(`/categories/${categoryId}`);
    return getData(response);
  },

  uploadImages: async (files) => {
    const formData = new FormData();
    const list = Array.isArray(files) ? files : [files];
    list.forEach((file) => {
      if (file) formData.append("images", file);
    });
    const response = await axiosInstance.post("/uploads/images", formData, {
      timeout: 30000,
    });
    return getData(response);
  },

  deleteUploadedImage: async (key) => {
    const response = await axiosInstance.delete(`/uploads/images/${key}`);
    return getData(response);
  },

  getColors: async () => {
    const response = await axiosInstance.get("/attributes/colors");
    return getData(response);
  },

  createColor: async (payload) => {
    const response = await axiosInstance.post("/attributes/colors", payload);
    return getData(response);
  },

  updateColor: async (colorId, payload) => {
    const response = await axiosInstance.patch(
      `/attributes/colors/${colorId}`,
      payload,
    );
    return getData(response);
  },

  deleteColor: async (colorId) => {
    const response = await axiosInstance.delete(
      `/attributes/colors/${colorId}`,
    );
    return getData(response);
  },

  getSizes: async () => {
    const response = await axiosInstance.get("/attributes/sizes");
    return getData(response);
  },

  createSize: async (payload) => {
    const response = await axiosInstance.post("/attributes/sizes", payload);
    return getData(response);
  },

  updateSize: async (sizeId, payload) => {
    const response = await axiosInstance.patch(
      `/attributes/sizes/${sizeId}`,
      payload,
    );
    return getData(response);
  },

  deleteSize: async (sizeId) => {
    const response = await axiosInstance.delete(`/attributes/sizes/${sizeId}`);
    return getData(response);
  },

  getHomepage: async () => {
    const response = await axiosInstance.get("/homepage");
    return getData(response);
  },

  getHomepageSections: async () => {
    const response = await axiosInstance.get("/homepage/sections");
    return getData(response);
  },

  updateHomepageSection: async (sectionKey, payload) => {
    const response = await axiosInstance.patch(
      `/homepage/sections/${sectionKey}`,
      payload,
    );
    return getData(response);
  },

  getHeroSlides: async () => {
    const response = await axiosInstance.get("/homepage/hero/slides");
    return getData(response);
  },

  getHealth: async () => {
    const response = await axiosInstance.get("/health");
    return getData(response);
  },
};
