import { createSlice } from "@reduxjs/toolkit";
import { loadState, saveState, removeState } from "@/utils/storage";
import { AUTH_KEY } from "./auth.constants";

const initialState = {
  user: loadState(AUTH_KEY, null),
  isAuthenticated: !!loadState(AUTH_KEY, null),
  loading: false,
  error: null,
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
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
      saveState(AUTH_KEY, action.payload);
    },
    loginFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
      removeState(AUTH_KEY);
      removeState("auth_token");
    },
    updateProfile(state, action) {
      if (!state.user) return;
      state.user = { ...state.user, ...action.payload };
      saveState(AUTH_KEY, state.user);
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, updateProfile } =
  authSlice.actions;
export default authSlice.reducer;
