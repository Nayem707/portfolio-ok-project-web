export const selectProducts = (state) => state.product.items;
export const selectProductById = (id) => (state) =>
  state.product.items.find((p) => p.id === id);
export const selectProductListMeta = (state) => state.product.listMeta;
export const selectProductsLoading = (state) => state.product.loading;
export const selectProductsError = (state) => state.product.error;
export const selectProductsMutationLoading = (state) =>
  state.product.mutationLoading;
export const selectCurrentProduct = (state) => state.product.currentProduct;
export const selectProductDetailsLoading = (state) =>
  state.product.detailsLoading;
export const selectProductDetailsError = (state) => state.product.detailsError;
export const selectFeaturedProducts = (state) => state.product.featuredItems;
export const selectPopularProducts = (state) => state.product.popularItems;
export const selectNewArrivalProducts = (state) =>
  state.product.newArrivalItems;
