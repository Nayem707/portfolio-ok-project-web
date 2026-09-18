import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "@/services/api";

const resolveItemKey = (productId, color, size) =>
  `${productId}-${color || "default"}-${size || "default"}`;

const normaliseSelector = (value) => ({
  id: value?.id ?? value?.productId ?? null,
  cartItemId: value?.cartItemId ?? null,
  itemKey: value?.itemKey ?? null,
  color: value?.color ?? value?.selectedColor ?? null,
  size: value?.size ?? value?.selectedSize ?? null,
});

const matchesCartItem = (item, selector) => {
  if (!selector) return false;

  if (selector.cartItemId) {
    return item.cartItemId === selector.cartItemId;
  }

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

const mapServerCart = (cart = {}) => ({
  id: cart.id ?? null,
  subtotal: Number(cart.subtotal || 0),
  totalItems: Number(cart.totalItems || 0),
  items: (cart.items || []).map((item) => ({
    id: item.productId,
    cartItemId: item.id,
    itemKey: resolveItemKey(
      item.productId,
      item.selectedColor,
      item.selectedSize,
    ),
    name: item.name,
    price: Number(item.price || 0),
    discount: Number(item.discount || 0),
    image: item.image,
    stock: item.stock,
    quantity: item.quantity,
    selectedColor: item.selectedColor || null,
    selectedSize: item.selectedSize || null,
    lineTotal: Number(item.lineTotal || 0),
  })),
});

export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.getCart();
      return mapServerCart(response);
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error?.message || "Failed to load cart",
      );
    }
  },
);

export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async (product, { rejectWithValue }) => {
    try {
      const response = await api.addCartItem({
        productId: product.id,
        quantity: Number(product.quantity || 1),
        selectedColor: product.selectedColor || undefined,
        selectedSize: product.selectedSize || undefined,
      });
      return mapServerCart(response);
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error?.message || "Failed to add item to cart",
      );
    }
  },
);

export const setQuantity = createAsyncThunk(
  "cart/setQuantity",
  async (payload, { getState, rejectWithValue }) => {
    try {
      const selector = normaliseSelector(payload);
      const items = getState().cart.items || [];
      const target = items.find((item) => matchesCartItem(item, selector));
      if (!target?.cartItemId) {
        return rejectWithValue("Cart item not found");
      }
      const response = await api.updateCartItem(target.cartItemId, {
        quantity: Number(payload.quantity),
      });
      return mapServerCart(response);
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error?.message || "Failed to update quantity",
      );
    }
  },
);

export const removeFromCart = createAsyncThunk(
  "cart/removeFromCart",
  async (payload, { getState, rejectWithValue }) => {
    try {
      const selector = normaliseSelector(payload);
      const items = getState().cart.items || [];
      const target = items.find((item) => matchesCartItem(item, selector));
      if (!target?.cartItemId) {
        return rejectWithValue("Cart item not found");
      }
      const response = await api.removeCartItem(target.cartItemId);
      return mapServerCart(response);
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error?.message || "Failed to remove item",
      );
    }
  },
);

export const clearCart = createAsyncThunk(
  "cart/clearCart",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.clearCart();
      return mapServerCart(response);
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error?.message || "Failed to clear cart",
      );
    }
  },
);

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    id: null,
    items: [],
    subtotal: 0,
    totalItems: 0,
    pendingProductIds: [],
    loading: false,
    mutating: false,
    error: null,
    initialized: false,
  },
  reducers: {
    resetCartState(state) {
      state.id = null;
      state.items = [];
      state.subtotal = 0;
      state.totalItems = 0;
      state.pendingProductIds = [];
      state.loading = false;
      state.mutating = false;
      state.error = null;
      state.initialized = true;
    },
  },
  extraReducers: (builder) => {
    const setFromPayload = (state, action) => {
      state.id = action.payload.id;
      state.items = action.payload.items;
      state.subtotal = action.payload.subtotal;
      state.totalItems = action.payload.totalItems;
      state.error = null;
      state.initialized = true;
    };

    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        setFromPayload(state, action);
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load cart";
        state.initialized = true;
      })
      .addCase(addToCart.pending, (state, action) => {
        state.mutating = true;
        state.error = null;
        const productId = action.meta.arg?.id;
        if (productId && !state.pendingProductIds.includes(productId)) {
          state.pendingProductIds.push(productId);
        }
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.mutating = false;
        const productId = action.meta.arg?.id;
        if (productId) {
          state.pendingProductIds = state.pendingProductIds.filter(
            (id) => id !== productId,
          );
        }
        setFromPayload(state, action);
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.mutating = false;
        const productId = action.meta.arg?.id;
        if (productId) {
          state.pendingProductIds = state.pendingProductIds.filter(
            (id) => id !== productId,
          );
        }
        state.error = action.payload || "Failed to add item to cart";
      })
      .addCase(setQuantity.pending, (state) => {
        state.mutating = true;
        state.error = null;
      })
      .addCase(setQuantity.fulfilled, (state, action) => {
        state.mutating = false;
        setFromPayload(state, action);
      })
      .addCase(setQuantity.rejected, (state, action) => {
        state.mutating = false;
        state.error = action.payload || "Failed to update quantity";
      })
      .addCase(removeFromCart.pending, (state) => {
        state.mutating = true;
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.mutating = false;
        setFromPayload(state, action);
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.mutating = false;
        state.error = action.payload || "Failed to remove item";
      })
      .addCase(clearCart.pending, (state) => {
        state.mutating = true;
        state.error = null;
      })
      .addCase(clearCart.fulfilled, (state, action) => {
        state.mutating = false;
        setFromPayload(state, action);
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.mutating = false;
        state.error = action.payload || "Failed to clear cart";
      });
  },
});

export const { resetCartState } = cartSlice.actions;
export default cartSlice.reducer;
