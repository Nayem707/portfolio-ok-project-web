import { createSlice } from "@reduxjs/toolkit";
import { loadState, saveState, removeState } from "@/utils/storage";
import { CART_STORAGE_KEY } from "./cart.constants";
import {
  buildCartItem,
  calcCartTotals,
  matchesCartItem,
  normalisePersistedItems,
  normaliseSelector,
  refreshLineTotals,
  requiresVariantSelection,
  resolveItemKey,
  toPackageOption,
} from "./cart.utils";

const emptyCart = {
  items: [],
  subtotal: 0,
  totalItems: 0,
};

const loadPersistedCart = () => {
  const saved = loadState(CART_STORAGE_KEY, null);
  if (!saved || !Array.isArray(saved.items)) {
    return { ...emptyCart };
  }
  const items = refreshLineTotals(normalisePersistedItems(saved.items));
  const totals = calcCartTotals(items);
  return {
    items,
    subtotal: totals.subtotal,
    totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
  };
};

const persistCart = (state) => {
  saveState(CART_STORAGE_KEY, {
    items: state.items,
    subtotal: state.subtotal,
    totalItems: state.totalItems,
  });
};

const applyTotals = (state) => {
  state.items = refreshLineTotals(state.items);
  const totals = calcCartTotals(state.items);
  state.subtotal = totals.subtotal;
  state.totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
  persistCart(state);
};

const persisted = loadPersistedCart();

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: persisted.items,
    subtotal: persisted.subtotal,
    totalItems: persisted.totalItems,
    pendingProductIds: [],
    loading: false,
    mutating: false,
    error: null,
    initialized: true,
  },
  reducers: {
    hydrateCart(state) {
      const next = loadPersistedCart();
      state.items = next.items;
      state.subtotal = next.subtotal;
      state.totalItems = next.totalItems;
      state.loading = false;
      state.error = null;
      state.initialized = true;
    },

    addToCart(state, action) {
      const product = action.payload;
      if (!product?.id) return;

      const quantity = Math.max(1, Number(product.quantity) || 1);
      const selectedColor = product.selectedColor || null;
      const selectedSize = product.selectedSize || null;
      if (requiresVariantSelection(product, selectedColor, selectedSize)) {
        return;
      }

      const draft = buildCartItem(
        { ...product, selectedColor, selectedSize },
        quantity,
      );
      const existing = state.items.find(
        (item) => item.itemKey === draft.itemKey,
      );

      if (existing) {
        const nextQty = existing.quantity + quantity;
        existing.quantity =
          existing.stock > 0 ? Math.min(nextQty, existing.stock) : nextQty;
      } else {
        state.items.unshift(draft);
      }

      applyTotals(state);
      state.error = null;
    },

    setQuantity(state, action) {
      const selector = normaliseSelector(action.payload);
      const quantity = Math.max(1, Number(action.payload?.quantity) || 1);
      const target = state.items.find((item) => matchesCartItem(item, selector));
      if (!target) return;

      target.quantity =
        target.stock > 0 ? Math.min(quantity, target.stock) : quantity;
      applyTotals(state);
      state.error = null;
    },

    updateCartItemOptions(state, action) {
      const selector = normaliseSelector(action.payload);
      const target = state.items.find((item) => matchesCartItem(item, selector));
      if (!target) return;

      const nextColor =
        action.payload.selectedColor !== undefined
          ? action.payload.selectedColor || null
          : target.selectedColor;
      const nextSize =
        action.payload.selectedSize !== undefined
          ? action.payload.selectedSize || null
          : target.selectedSize;

      // Resolve a package change (by object or id) against the line's stored options.
      const packageChanged =
        action.payload.selectedPackage !== undefined ||
        action.payload.selectedPackageId !== undefined;
      let nextPackage;
      if (packageChanged) {
        const nextPkgId =
          action.payload.selectedPackage?.id ??
          action.payload.selectedPackageId ??
          null;
        nextPackage = nextPkgId
          ? (target.packageOptions || []).find((pkg) => pkg.id === nextPkgId) ||
            (action.payload.selectedPackage
              ? toPackageOption(action.payload.selectedPackage)
              : null)
          : null;
      }

      const resolvedPackageId = packageChanged
        ? nextPackage?.id || null
        : target.selectedPackageId || null;
      const nextKey = resolveItemKey(
        target.id,
        nextColor,
        nextSize,
        resolvedPackageId,
      );

      const applyPackage = (item) => {
        if (!packageChanged) return;
        item.selectedPackageId = nextPackage?.id || null;
        item.packageName = nextPackage?.name || null;
        item.packagePrice = nextPackage ? Number(nextPackage.price) : null;
        item.packageComponents = nextPackage?.items || null;
        // Add-on model: product price + selected package price (0 when "None").
        item.price =
          Number(item.productPrice ?? 0) +
          (nextPackage ? Number(nextPackage.price) : 0);
      };

      if (nextKey === target.itemKey) {
        target.selectedColor = nextColor;
        target.selectedSize = nextSize;
        applyPackage(target);
        applyTotals(state);
        return;
      }

      const duplicate = state.items.find(
        (item) => item.itemKey === nextKey && item.cartItemId !== target.cartItemId,
      );

      if (duplicate) {
        const mergedQty = duplicate.quantity + target.quantity;
        duplicate.quantity =
          duplicate.stock > 0
            ? Math.min(mergedQty, duplicate.stock)
            : mergedQty;
        state.items = state.items.filter(
          (item) => item.cartItemId !== target.cartItemId,
        );
      } else {
        target.selectedColor = nextColor;
        target.selectedSize = nextSize;
        applyPackage(target);
        target.itemKey = nextKey;
        target.cartItemId = nextKey;
      }

      applyTotals(state);
      state.error = null;
    },

    removeFromCart(state, action) {
      const selector = normaliseSelector(action.payload);
      state.items = state.items.filter(
        (item) => !matchesCartItem(item, selector),
      );
      applyTotals(state);
      state.error = null;
    },

    clearCart(state) {
      state.items = [];
      state.subtotal = 0;
      state.totalItems = 0;
      state.pendingProductIds = [];
      state.error = null;
      removeState(CART_STORAGE_KEY);
    },

    resetCartState(state) {
      // Local cart is guest-friendly — keep persisted items across logout.
      const next = loadPersistedCart();
      state.items = next.items;
      state.subtotal = next.subtotal;
      state.totalItems = next.totalItems;
      state.pendingProductIds = [];
      state.loading = false;
      state.mutating = false;
      state.error = null;
      state.initialized = true;
    },
  },
});

export const {
  hydrateCart,
  addToCart,
  setQuantity,
  updateCartItemOptions,
  removeFromCart,
  clearCart,
  resetCartState,
} = cartSlice.actions;

export default cartSlice.reducer;
