export const APP_NAME = "Shoply";

export const ROLES = {
  USER: "USER",
  ADMIN: "ADMIN",
};

export const ORDER_STATUS = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export const ORDER_STATUS_FLOW = [
  ORDER_STATUS.PENDING,
  ORDER_STATUS.CONFIRMED,
  ORDER_STATUS.PROCESSING,
  ORDER_STATUS.SHIPPED,
  ORDER_STATUS.DELIVERED,
];

export const PAYMENT_STATUS = {
  PAID: "Paid",
  UNPAID: "Unpaid",
  REFUNDED: "Refunded",
};

export const toOrderStatusKey = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const upper = raw.toUpperCase().replace(/\s+/g, "_");
  if (ORDER_STATUS[upper]) return upper;
  const match = Object.entries(ORDER_STATUS).find(
    ([, label]) => label.toLowerCase() === raw.toLowerCase(),
  );
  return match?.[0] || upper;
};

export const toOrderStatusLabel = (value) =>
  ORDER_STATUS[toOrderStatusKey(value)] || value || "";

export const toPaymentStatusKey = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const upper = raw.toUpperCase().replace(/\s+/g, "_");
  if (PAYMENT_STATUS[upper]) return upper;
  const match = Object.entries(PAYMENT_STATUS).find(
    ([, label]) => label.toLowerCase() === raw.toLowerCase(),
  );
  return match?.[0] || upper;
};

export const toPaymentStatusLabel = (value) =>
  PAYMENT_STATUS[toPaymentStatusKey(value)] || value || "";

export const PAYMENT_METHODS = {
  COD: "Cash on Delivery",
  ONLINE: "Online Payment",
};

export const PRODUCT_STATUS = {
  ACTIVE: "Active",
  DRAFT: "Draft",
  ARCHIVED: "Archived",
};

export const toProductStatusKey = (value) =>
  String(value || "").trim().toUpperCase();

export const toProductStatusLabel = (value) =>
  PRODUCT_STATUS[toProductStatusKey(value)] || value || "";

export const USER_STATUS = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
};

export const SORT_OPTIONS = [
  { label: "Featured", value: "featured" },
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Top Rated", value: "rating" },
];

export const PAGE_SIZE = 20;

export const SHIPPING_FLAT_RATE = 12;
export const FREE_SHIPPING_THRESHOLD = 150;
