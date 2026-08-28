export const formatCurrency = (value = 0) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(Number(value) || 0);

export const formatDate = (value) => {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatDateTime = (value) => {
  if (!value) return "";
  return new Date(value).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getDiscountedPrice = (price, discount = 0) => {
  const d = Number(discount) || 0;
  if (d <= 0) return price;
  return +(price - (price * d) / 100).toFixed(2);
};

export const getDiscountPercent = (price, discount = 0) => Math.round(discount);

export const truncate = (str = "", length = 60) =>
  str.length > length ? `${str.slice(0, length).trim()}…` : str;

export const range = (n) => Array.from({ length: n }, (_, i) => i);

export const classNames = (...classes) => classes.filter(Boolean).join(" ");

export const slugify = (str = "") =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
