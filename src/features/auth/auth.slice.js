import { createSlice } from "@reduxjs/toolkit";
import { loadState, saveState, removeState } from "@/utils/storage";
import { AUTH_KEY } from "./auth.constants";

const normalizeUser = (user) => {
  if (!user) return null;

  // Prefer explicit avatarUrl from the API (including null/"" to clear).
  // Fall back to legacy `avatar` only when avatarUrl was not provided.
  const hasAvatarUrl = Object.prototype.hasOwnProperty.call(user, "avatarUrl");
  const avatarUrl = hasAvatarUrl
    ? user.avatarUrl || null
    : user.avatar || user.image || null;

  return {
    ...user,
    avatarUrl,
    avatar: avatarUrl,
    authProvider: user.authProvider || "LOCAL",
    isGoogleVerified:
      typeof user.isGoogleVerified === "boolean"
        ? user.isGoogleVerified
        : String(user.authProvider || "").toUpperCase() === "GOOGLE",
  };
};

const initialState = {
  user: loadState(AUTH_KEY, null),
  isAuthenticated:
    !!loadState(AUTH_KEY, null) || !!localStorage.getItem("auth_token"),
  loading: false,
  error: null,
  initialized: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart(state) {
      state.loading = true;
      state.error = null;
    },
    loginSuccess(state, action) {
      const user = normalizeUser(action.payload?.user ?? action.payload);
      const accessToken = action.payload?.accessToken ?? null;
      const refreshToken = action.payload?.refreshToken ?? null;

      state.user = user;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
      state.initialized = true;

      if (accessToken) {
        localStorage.setItem("auth_token", accessToken);
      }
      if (refreshToken) {
        localStorage.setItem("refresh_token", refreshToken);
      }

      saveState(AUTH_KEY, user);
    },
    restoreAuth(state, action) {
      const user = normalizeUser(
        action.payload?.user ?? action.payload ?? null,
      );
      state.user = user;
      state.isAuthenticated = !!user;
      state.loading = false;
      state.error = null;
      state.initialized = true;

      if (user) {
        saveState(AUTH_KEY, user);
      } else {
        removeState(AUTH_KEY);
      }
    },
    loginFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      state.initialized = true;
      removeState(AUTH_KEY);
      removeState("auth_token");
      removeState("access_token");
      removeState("refresh_token");
    },
    finishAuthInitialization(state) {
      state.initialized = true;
    },
    updateProfile(state, action) {
      if (!state.user) return;
      state.user = normalizeUser({ ...state.user, ...action.payload });
      saveState(AUTH_KEY, state.user);
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  restoreAuth,
  finishAuthInitialization,
  logout,
  updateProfile,
} = authSlice.actions;
export default authSlice.reducer;
