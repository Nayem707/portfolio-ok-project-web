export const selectDashboardOverview = (state) => state.dashboard.overview;
export const selectDashboardStats = (state) => state.dashboard.stats;
export const selectDashboardLoading = (state) => state.dashboard.loading;
export const selectDashboardError = (state) => state.dashboard.error;

export const selectDashboardSalesByMonth = (state) =>
  state.dashboard.overview?.salesByMonth || [];

export const selectDashboardTopProducts = (state) =>
  state.dashboard.stats?.topProducts || [];

export const selectDashboardRecentOrders = (state) =>
  state.dashboard.stats?.recentOrders || [];

export const selectDashboardRecentUsers = (state) =>
  state.dashboard.overview?.recentUsers || [];
