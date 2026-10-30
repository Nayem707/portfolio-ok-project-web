import { SHIPPING_FLAT_RATE, FREE_SHIPPING_THRESHOLD } from "@/constants";
import { getDiscountedPrice, getProductImage } from "@/utils";

export const resolveItemKey = (productId, color, size, packageId) =>
  `${productId}-${color || "default"}-${size || "default"}-${packageId || "default"}`;

export const normaliseSelector = (value) => ({
  id: value?.id ?? value?.productId ?? null,
  cartItemId: value?.cartItemId ?? null,
  itemKey: value?.itemKey ?? null,
  color: value?.color ?? value?.selectedColor ?? null,
  size: value?.size ?? value?.selectedSize ?? null,
  packageId: value?.packageId ?? value?.selectedPackageId ?? null,
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
  const itemPackage = item.selectedPackageId ?? null;
  const selectorColor = selector.color ?? null;
  const selectorSize = selector.size ?? null;
  const selectorPackage = selector.packageId ?? null;

  if (selectorColor || selectorSize || selectorPackage) {
    return (
      item.id === selector.id &&
      itemColor === selectorColor &&
      itemSize === selectorSize &&
      itemPackage === selectorPackage
    );
  }

  return item.id === selector.id && !itemColor && !itemSize && !itemPackage;
};

export const getProductColorOptions = (product) => {
  if (!Array.isArray(product?.colors) || product.colors.length === 0) {
    return [];
  }
  return product.colors
    .map((color) => (typeof color === "string" ? color : color?.name))
    .filter(Boolean);
};

export const getProductSizeOptions = (product) => {
  if (!Array.isArray(product?.sizes) || product.sizes.length === 0) {
    return [];
  }
  return product.sizes
    .map((size) => (typeof size === "string" ? size : size?.name))
    .filter(Boolean);
};

/**
 * Active packages offered for a product. Reads `product.packages` (API shape) or
 * `product.packageOptions` (snapshot kept on a cart line for in-cart switching).
 */
export const getProductPackageOptions = (product) => {
  const list = Array.isArray(product?.packages)
    ? product.packages
    : Array.isArray(product?.packageOptions)
      ? product.packageOptions
      : [];
  return list.filter((pkg) => pkg && (pkg.status ? pkg.status === "ACTIVE" : true));
};

/** Compact snapshot of a package kept on the cart line (localStorage friendly). */
export const toPackageOption = (pkg) => ({
  id: pkg.id,
  name: pkg.name,
  price: Number(pkg.price || 0),
  isDefault: Boolean(pkg.isDefault),
  items: Array.isArray(pkg.items)
    ? pkg.items.map((line) => ({
        name: line.name,
        variant: line.variant ?? null,
        quantity: Number(line.quantity) || 1,
      }))
    : [],
});

/** The package that should be pre-selected for a product, if any. */
export const getDefaultPackage = (product) => {
  const options = getProductPackageOptions(product);
  if (options.length === 0) return null;
  return options.find((pkg) => pkg.isDefault) || options[0];
};

export const getMissingVariantLabels = (
  product,
  selectedColor = null,
  selectedSize = null,
) => {
  const missing = [];
  if (getProductColorOptions(product).length > 0 && !selectedColor) {
    missing.push("color");
  }
  if (getProductSizeOptions(product).length > 0 && !selectedSize) {
    missing.push("size");
  }
  // Packages are optional (customers may choose "None"), so they never block adding.
  return missing;
};

export const requiresVariantSelection = (
  product,
  selectedColor = null,
  selectedSize = null,
) => getMissingVariantLabels(product, selectedColor, selectedSize).length > 0;

/** Base price for a line: the product's own price plus any selected add-on package. */
export const getLineBasePrice = (productPrice, pkg) =>
  Number(productPrice || 0) + (pkg ? Number(pkg.price || 0) : 0);

export const buildCartItem = (product, quantity = 1) => {
  const selectedColor = product.selectedColor || null;
  const selectedSize = product.selectedSize || null;

  const packageOptions = getProductPackageOptions(product).map(toPackageOption);
  const selectedPackageId =
    product.selectedPackageId ?? product.selectedPackage?.id ?? null;
  const selectedPackage =
    (product.selectedPackage
      ? toPackageOption(product.selectedPackage)
      : packageOptions.find((pkg) => pkg.id === selectedPackageId)) || null;

  const productPrice = Number(product.price || 0);
  // A selected package is an add-on: its price is ADDED to the product price.
  const basePrice = getLineBasePrice(productPrice, selectedPackage);

  const qty = Math.max(1, Number(quantity) || 1);
  const stock = Number(product.stock ?? 0);
  const clampedQty = stock > 0 ? Math.min(qty, stock) : qty;
  const itemKey = resolveItemKey(
    product.id,
    selectedColor,
    selectedSize,
    selectedPackage?.id || null,
  );

  return {
    id: product.id,
    cartItemId: itemKey,
    itemKey,
    name: product.name,
    price: Number(basePrice || 0),
    productPrice,
    baseCurrency: product.baseCurrency || "BDT",
    discount: Number(product.discount || 0),
    image: getProductImage(product) || null,
    category: product.categoryTitle || product.category || null,
    stock,
    quantity: clampedQty,
    selectedColor,
    selectedSize,
    selectedPackageId: selectedPackage?.id || null,
    packageName: selectedPackage?.name || null,
    packagePrice: selectedPackage ? Number(selectedPackage.price) : null,
    packageComponents: selectedPackage?.items || null,
    packageOptions,
    lineTotal: +(getDiscountedPrice(basePrice, product.discount) * clampedQty).toFixed(2),
  };
};

export const refreshLineTotals = (items = []) =>
  items.map((item) => ({
    ...item,
    lineTotal: +(
      getDiscountedPrice(item.price, item.discount) * item.quantity
    ).toFixed(2),
  }));

/**
 * Normalises persisted cart lines so items created before package support still work:
 * rebuilds the item key with the package dimension and backfills package fields.
 */
export const normalisePersistedItems = (items = []) =>
  items.map((item) => {
    const itemKey = resolveItemKey(
      item.id,
      item.selectedColor || null,
      item.selectedSize || null,
      item.selectedPackageId || null,
    );
    return {
      ...item,
      selectedPackageId: item.selectedPackageId ?? null,
      packageName: item.packageName ?? null,
      packagePrice: item.packagePrice ?? null,
      packageComponents: item.packageComponents ?? null,
      packageOptions: Array.isArray(item.packageOptions) ? item.packageOptions : [],
      productPrice: item.productPrice ?? item.price,
      itemKey,
      cartItemId: itemKey,
    };
  });

export const calcCartTotals = (
  items = [],
  {
    shippingFlatRate = SHIPPING_FLAT_RATE,
    freeShippingMin = FREE_SHIPPING_THRESHOLD,
  } = {},
) => {
  const subtotal = items.reduce(
    (sum, item) =>
      sum + getDiscountedPrice(item.price, item.discount) * item.quantity,
    0,
  );
  const shipping =
    subtotal === 0 || subtotal >= freeShippingMin ? 0 : shippingFlatRate;
  const total = subtotal + shipping;
  return {
    subtotal: +subtotal.toFixed(2),
    shipping: +shipping.toFixed(2),
    total: +total.toFixed(2),
  };
};
