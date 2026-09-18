import { SHIPPING_FLAT_RATE, FREE_SHIPPING_THRESHOLD } from "@/constants";
import { getDiscountedPrice } from "@/utils";

export const resolveItemKey = (productId, color, size) =>
  `${productId}-${color || "default"}-${size || "default"}`;

export const normaliseSelector = (value) => ({
  id: value?.id ?? value?.productId ?? null,
  cartItemId: value?.cartItemId ?? null,
  itemKey: value?.itemKey ?? null,
  color: value?.color ?? value?.selectedColor ?? null,
  size: value?.size ?? value?.selectedSize ?? null,
});

export const matchesCartItem = (item, selector) => {
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

export const buildCartItem = (product, quantity = 1) => {
  const colorOptions = Array.isArray(product.colors) ? product.colors : [];
  const sizeOptions = Array.isArray(product.sizes) ? product.sizes : [];
  const selectedColor =
    product.selectedColor ||
    (typeof colorOptions[0] === "string"
      ? colorOptions[0]
      : colorOptions[0]?.name) ||
    null;
  const selectedSize =
    product.selectedSize ||
    (typeof sizeOptions[0] === "string"
      ? sizeOptions[0]
      : sizeOptions[0]?.name) ||
    null;
  const qty = Math.max(1, Number(quantity) || 1);
  const stock = Number(product.stock ?? 0);
  const clampedQty = stock > 0 ? Math.min(qty, stock) : qty;
  const itemKey = resolveItemKey(product.id, selectedColor, selectedSize);

  return {
    id: product.id,
    cartItemId: itemKey,
    itemKey,
    name: product.name,
    price: Number(product.price || 0),
    discount: Number(product.discount || 0),
    image: product.images?.[0] || product.image || null,
    category: product.category || null,
    stock,
    quantity: clampedQty,
    selectedColor,
    selectedSize,
    lineTotal: +(
      getDiscountedPrice(product.price, product.discount) * clampedQty
    ).toFixed(2),
  };
};

export const refreshLineTotals = (items = []) =>
  items.map((item) => ({
    ...item,
    lineTotal: +(
      getDiscountedPrice(item.price, item.discount) * item.quantity
    ).toFixed(2),
  }));

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
