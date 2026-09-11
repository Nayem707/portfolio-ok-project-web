export const selectHomePageSections = (state) => state.homePage.sections;
export const selectHomePageLoading = (state) => state.homePage.loading;
export const selectHomePageError = (state) => state.homePage.error;
export const selectHeroSlides = (state) => state.homePage.heroSlides;
export const selectHomeCategories = (state) => state.homePage.categories;
export const selectFeaturedCollection = (state) => state.homePage.featured;
export const selectPopularCollection = (state) => state.homePage.popular;
export const selectNewArrivalsCollection = (state) =>
  state.homePage.newArrivals;
