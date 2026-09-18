export const selectAdminUsers = (state) => state.users.items;
export const selectAdminUsersMeta = (state) => state.users.meta;
export const selectAdminUsersLoading = (state) => state.users.loading;
export const selectAdminUsersError = (state) => state.users.error;
export const selectAdminCurrentUser = (state) => state.users.currentUser;
export const selectAdminUserDetailsLoading = (state) =>
  state.users.loadingDetails;
export const selectAdminUserUpdatingStatus = (state) =>
  state.users.updatingStatus;
