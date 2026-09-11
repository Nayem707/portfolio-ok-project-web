import { createSlice } from "@reduxjs/toolkit";
import { loadState, saveState } from "@/utils/storage";

const CART_KEY = "cart_items";

const initialState = {
  items: loadState(CART_KEY, []),
};

const persist = (state) => saveState(CART_KEY, state.items);

const resolveItemKey = (product) => {
  const color = product.selectedColor || "default";
  const size = product.selectedSize || "default";
  return product.itemKey || `${product.id}-${color}-${size}`;
};

const normaliseSelector = (value) => ({
  id: value?.id ?? null,
  itemKey: value?.itemKey ?? null,
  color: value?.color ?? value?.selectedColor ?? null,
  size: value?.size ?? value?.selectedSize ?? null,
});

const matchesCartItem = (item, selector) => {
  if (!selector) return false;

  if (selector.itemKey) {
    return item.itemKey === selector.itemKey;
  }

  if (!selector.id) return false;

  const itemColor = item.selectedColor ?? null;
  const itemSize = item.selectedSize ?? null;
  const selectorColor = selector.color ?? null;
  const selectorSize = selector.size ?? null;

  if (selectorColor || selectorSize) {
    return (
      item.id === selector.id &&
      itemColor === selectorColor &&
      itemSize === selectorSize
    );
  }

  return item.id === selector.id && !itemColor && !itemSize;
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart(state, action) {
      const product = action.payload;
      const quantity = Number(product.quantity || 1);
      const selector = normaliseSelector(product);
      const itemKey = resolveItemKey(product);
      const existing = state.items.find(
        (i) => i.itemKey === itemKey || matchesCartItem(i, selector),
      );

      if (existing) {
        existing.quantity = Math.min(
          existing.quantity + quantity,
          product.stock || 99,
        );
      } else {
        state.items.push({
          id: product.id,
          itemKey,
          name: product.name,
          price: product.price,
          discount: product.discount || 0,
          image: product.image || product.images?.[0],
          stock: product.stock,
          category: product.category,
          quantity,
          selectedColor: product.selectedColor || null,
          selectedSize: product.selectedSize || null,
        });
      }
      persist(state);
    },
    removeFromCart(state, action) {
      const selector = normaliseSelector(action.payload);
      state.items = state.items.filter(
        (item) => !matchesCartItem(item, selector),
      );
      persist(state);
    },
    incrementQty(state, action) {
      const selector = normaliseSelector(action.payload);
      const item = state.items.find((i) => matchesCartItem(i, selector));
      if (item) item.quantity = Math.min(item.quantity + 1, item.stock || 99);
      persist(state);
    },
    decrementQty(state, action) {
      const selector = normaliseSelector(action.payload);
      const item = state.items.find((i) => matchesCartItem(i, selector));
      if (item && item.quantity > 1) item.quantity -= 1;
      persist(state);
    },
    setQuantity(state, action) {
      const selector = normaliseSelector(action.payload);
      const item = state.items.find((i) => matchesCartItem(i, selector));
      if (item)
        item.quantity = Math.max(
          1,
          Math.min(action.payload.quantity, item.stock || 99),
        );
      persist(state);
    },
    clearCart(state) {
      state.items = [];
      persist(state);
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  incrementQty,
  decrementQty,
  setQuantity,
  clearCart,
} = cartSlice.actions;
export default cartSlice.reducer;
