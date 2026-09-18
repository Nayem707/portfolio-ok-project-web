export const selectOrders = (state) => state.order.items;
export const selectAdminOrdersMeta = (state) => state.order.adminMeta;
export const selectOrderById = (id) => (state) =>
  state.order.items.find((o) => o.id === id) ||
  (state.order.currentOrder?.id === id ? state.order.currentOrder : null);
export const selectOrdersByUser = (userId) => (state) =>
  state.order.items.filter((o) => o.customer?.id === userId);

export const selectMyOrders = (state) => state.order.myItems;
export const selectMyOrdersMeta = (state) => state.order.myMeta;
export const selectCurrentOrder = (state) => state.order.currentOrder;
export const selectOrdersLoading = (state) => state.order.loading;
export const selectOrderDetailsLoading = (state) => state.order.loadingDetails;
export const selectOrderUpdatingStatus = (state) => state.order.updatingStatus;
export const selectOrderPlacing = (state) => state.order.placingOrder;
export const selectOrdersError = (state) => state.order.error;
