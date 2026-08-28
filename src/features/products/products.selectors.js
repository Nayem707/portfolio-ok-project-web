export const selectProducts = (state) => state.product.items;
export const selectProductById = (id) => (state) =>
  state.product.items.find((p) => p.id === id);
