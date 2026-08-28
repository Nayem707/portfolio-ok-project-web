import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  mobileMenuOpen: false,
  miniCartOpen: false,
  adminSidebarOpen: false,
  searchQuery: "",
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleMobileMenu(state, action) {
      state.mobileMenuOpen = action.payload ?? !state.mobileMenuOpen;
    },
    toggleMiniCart(state, action) {
      state.miniCartOpen = action.payload ?? !state.miniCartOpen;
    },
    toggleAdminSidebar(state, action) {
      state.adminSidebarOpen = action.payload ?? !state.adminSidebarOpen;
    },
    setSearchQuery(state, action) {
      state.searchQuery = action.payload;
    },
  },
});

export const {
  toggleMobileMenu,
  toggleMiniCart,
  toggleAdminSidebar,
  setSearchQuery,
} = uiSlice.actions;
export default uiSlice.reducer;
