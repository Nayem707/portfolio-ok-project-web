import { createSlice } from "@reduxjs/toolkit";
import { loadState, saveState } from "@/utils/storage";

const WISHLIST_KEY = "wishlist_items";

const initialState = {
  items: loadState(WISHLIST_KEY, []),
};

const persist = (state) => saveState(WISHLIST_KEY, state.items);

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    toggleWishlist(state, action) {
      const product = action.payload;
      const exists = state.items.find((i) => i.id === product.id);
      if (exists) {
        state.items = state.items.filter((i) => i.id !== product.id);
      } else {
        state.items.push({
          id: product.id,
          name: product.name,
          price: product.price,
          discount: product.discount || 0,
          image: product.image || product.images?.[0],
          stock: product.stock,
          category: product.category,
          rating: product.rating,
        });
      }
      persist(state);
    },
    removeFromWishlist(state, action) {
      state.items = state.items.filter((i) => i.id !== action.payload);
      persist(state);
    },
    clearWishlist(state) {
      state.items = [];
      persist(state);
    },
  },
});

export const { toggleWishlist, removeFromWishlist, clearWishlist } =
  wishlistSlice.actions;
export default wishlistSlice.reducer;
