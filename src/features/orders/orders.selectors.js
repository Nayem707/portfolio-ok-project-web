export const selectOrders = (state) => state.order.items;
export const selectOrderById = (id) => (state) =>
  state.order.items.find((o) => o.id === id);
export const selectOrdersByUser = (userId) => (state) =>
  state.order.items.filter((o) => o.customer?.id === userId);
