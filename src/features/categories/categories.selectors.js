export const selectCategories = (state) =>
  Array.isArray(state.category.items) ? state.category.items : [];
export const selectCategoriesLoading = (state) => state.category.loading;
export const selectCategoriesError = (state) => state.category.error;
