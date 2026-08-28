import { createSelector } from "@reduxjs/toolkit";
import { calcCartTotals } from "./cart.utils";

export const selectCartItems = (state) => state.cart.items;
export const selectCartCount = createSelector(selectCartItems, (items) =>
  items.reduce((sum, i) => sum + i.quantity, 0),
);
export const selectCartTotals = createSelector(selectCartItems, (items) =>
  calcCartTotals(items),
);
