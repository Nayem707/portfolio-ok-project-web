import { ROLES } from "@/constants";

export const selectAuth = (state) => state.auth;
export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAdmin = (state) => state.auth.user?.role === ROLES.ADMIN;
