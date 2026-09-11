import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

const readAccessToken = () =>
  localStorage.getItem("auth_token") || localStorage.getItem("access_token");

axiosInstance.interceptors.request.use((config) => {
  const token = readAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = localStorage.getItem("refresh_token");

      if (!refreshToken) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        originalRequest._retry = true;
        const response = await axiosInstance.post("/auth/refresh", { refreshToken });
        const payload = response?.data?.data ?? response?.data ?? {};
        const nextAccessToken = payload.accessToken;
        const nextRefreshToken = payload.refreshToken;

        if (nextAccessToken) {
          localStorage.setItem("auth_token", nextAccessToken);
        }
        if (nextRefreshToken) {
          localStorage.setItem("refresh_token", nextRefreshToken);
        }

        originalRequest.headers.Authorization = `Bearer ${nextAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        const savedUser = JSON.parse(localStorage.getItem("auth_user") || "null");
        if (savedUser) {
          localStorage.removeItem("auth_user");
        }
        window.dispatchEvent(new CustomEvent("auth:logout"));
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
