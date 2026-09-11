export const selectHomePageSections = (state) => state.homePage.sections;
export const selectHomePageLoading = (state) => state.homePage.loading;
export const selectHomePageError = (state) => state.homePage.error;
export const selectHeroSlides = (state) =>
  Array.isArray(state.homePage.heroSlides) ? state.homePage.heroSlides : [];
export const selectHomeCategories = (state) =>
  Array.isArray(state.homePage.categories) ? state.homePage.categories : [];
export const selectFeaturedCollection = (state) =>
  Array.isArray(state.homePage.featured) ? state.homePage.featured : [];
export const selectPopularCollection = (state) =>
  Array.isArray(state.homePage.popular) ? state.homePage.popular : [];
export const selectNewArrivalsCollection = (state) =>
  Array.isArray(state.homePage.newArrivals) ? state.homePage.newArrivals : [];
