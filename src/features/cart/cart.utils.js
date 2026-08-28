import { SHIPPING_FLAT_RATE, FREE_SHIPPING_THRESHOLD } from "@/constants";
import { getDiscountedPrice } from "@/utils";

export const calcCartTotals = (items = []) => {
  const subtotal = items.reduce(
    (sum, item) =>
      sum + getDiscountedPrice(item.price, item.discount) * item.quantity,
    0,
  );
  const shipping =
    subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD
      ? 0
      : SHIPPING_FLAT_RATE;
  const total = subtotal + shipping;
  return {
    subtotal: +subtotal.toFixed(2),
    shipping: +shipping.toFixed(2),
    total: +total.toFixed(2),
  };
};
