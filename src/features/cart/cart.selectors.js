import { createSelector } from "@reduxjs/toolkit";
import { calcCartTotals } from "./cart.utils";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FLAT_RATE } from "@/constants";

export const selectCartItems = (state) => state.cart.items;
export const selectCartPendingProductIds = (state) =>
  state.cart.pendingProductIds || [];

export const selectCartCount = createSelector(selectCartItems, (items) =>
  items.reduce((sum, i) => sum + i.quantity, 0),
);

const selectShippingFlatRate = (state) =>
  state.settings?.data?.shippingFlatRate ?? SHIPPING_FLAT_RATE;

export const selectFreeShippingMin = (state) =>
  state.settings?.data?.freeShippingMin ?? FREE_SHIPPING_THRESHOLD;

export const selectCartTotals = createSelector(
  selectCartItems,
  selectShippingFlatRate,
  selectFreeShippingMin,
  (items, shippingFlatRate, freeShippingMin) =>
    calcCartTotals(items, { shippingFlatRate, freeShippingMin }),
);

export const selectIsProductInCart = (productId) => (state) =>
  selectCartItems(state).some((item) => item.id === productId);

export const selectIsProductAddPending = (productId) => (state) =>
  selectCartPendingProductIds(state).includes(productId);
