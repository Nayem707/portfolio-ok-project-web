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
