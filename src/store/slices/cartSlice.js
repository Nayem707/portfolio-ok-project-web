import { createSlice, createSelector } from "@reduxjs/toolkit";
import { loadState, saveState } from "@/utils/storage";
import { calcCartTotals } from "@/utils";

const CART_KEY = "cart_items";

const initialState = {
  items: loadState(CART_KEY, []),
};

const persist = (state) => saveState(CART_KEY, state.items);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart(state, action) {
      const product = action.payload;
      const quantity = product.quantity || 1;
      const existing = state.items.find((i) => i.id === product.id);
      if (existing) {
        existing.quantity = Math.min(
          existing.quantity + quantity,
          product.stock || 99,
        );
      } else {
        state.items.push({
          id: product.id,
          name: product.name,
          price: product.price,
          discount: product.discount || 0,
          image: product.image || product.images?.[0],
          stock: product.stock,
          category: product.category,
          quantity,
        });
      }
      persist(state);
    },
    removeFromCart(state, action) {
      state.items = state.items.filter((i) => i.id !== action.payload);
      persist(state);
    },
    incrementQty(state, action) {
      const item = state.items.find((i) => i.id === action.payload);
      if (item) item.quantity = Math.min(item.quantity + 1, item.stock || 99);
      persist(state);
    },
    decrementQty(state, action) {
      const item = state.items.find((i) => i.id === action.payload);
      if (item && item.quantity > 1) item.quantity -= 1;
      persist(state);
    },
    setQuantity(state, action) {
      const { id, quantity } = action.payload;
      const item = state.items.find((i) => i.id === id);
      if (item)
        item.quantity = Math.max(1, Math.min(quantity, item.stock || 99));
      persist(state);
    },
    clearCart(state) {
      state.items = [];
      persist(state);
    },
  },
});

export const selectCartItems = (state) => state.cart.items;
export const selectCartCount = createSelector(selectCartItems, (items) =>
  items.reduce((sum, i) => sum + i.quantity, 0),
);
export const selectCartTotals = createSelector(selectCartItems, (items) =>
  calcCartTotals(items),
);

export const {
  addToCart,
  removeFromCart,
  incrementQty,
  decrementQty,
  setQuantity,
  clearCart,
} = cartSlice.actions;
export default cartSlice.reducer;
