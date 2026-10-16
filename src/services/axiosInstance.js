import axios from "axios";
import { AUTH_KEY } from "@/features/auth/auth.constants";
import { buildLoginUrl } from "@/features/auth/auth.redirect";

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const BASE_URL = configuredBaseUrl || "/api/v1";

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
  // Let the runtime set multipart boundary for FormData bodies.
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  return config;
});

// Credential endpoints report their own 401s (e.g. wrong password); never refresh/redirect for them.
const isCredentialRequest = (url = "") =>
  /\/auth\/(login|register|google|refresh|logout|forgot-password|reset-password)(\?|$)/.test(
    url,
  );

let refreshPromise = null;

// One refresh at a time: refresh tokens rotate, so parallel refreshes would revoke each other.
const refreshSession = (refreshToken) => {
  refreshPromise ??= axiosInstance
    .post("/auth/refresh", { refreshToken })
    .then((response) => {
      const payload = response?.data?.data ?? response?.data ?? {};
      if (!payload.accessToken) throw new Error("Session refresh failed");
      localStorage.setItem("auth_token", payload.accessToken);
      if (payload.refreshToken) {
        localStorage.setItem("refresh_token", payload.refreshToken);
      }
      return payload.accessToken;
    })
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
};

const endSession = () => {
  ["auth_token", "access_token", "refresh_token", AUTH_KEY].forEach((key) =>
    localStorage.removeItem(key),
  );
  window.dispatchEvent(new CustomEvent("auth:logout"));
  const { pathname, search } = window.location;
  window.location.href = buildLoginUrl(`${pathname}${search}`);
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isCredentialRequest(originalRequest.url)
    ) {
      return Promise.reject(error);
    }

    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) {
      endSession();
      return Promise.reject(error);
    }

    try {
      originalRequest._retry = true;
      const nextAccessToken = await refreshSession(refreshToken);
      originalRequest.headers.Authorization = `Bearer ${nextAccessToken}`;
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      endSession();
      return Promise.reject(refreshError);
    }
  },
);

export default axiosInstance;
