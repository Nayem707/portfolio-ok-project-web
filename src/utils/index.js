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

/**
 * Origin used to resolve relative `/uploads/...` media paths.
 * Prefer VITE_MEDIA_BASE_URL; fall back to VITE_API_BASE_URL origin.
 */
export const getMediaOrigin = () => {
  const configured =
    import.meta.env.VITE_MEDIA_BASE_URL?.trim() ||
    import.meta.env.VITE_API_BASE_URL?.trim() ||
    "";
  if (!configured || configured.startsWith("/")) return "";
  try {
    return new URL(configured).origin;
  } catch {
    return configured.replace(/\/?api\/v1\/?$/i, "").replace(/\/$/, "");
  }
};

/**
 * Resolve stored media paths for <img src>.
 * - Absolute http(s)/data/blob URLs are unchanged (legacy + external).
 * - Relative `/uploads/<file>` paths are prefixed with the API/media origin.
 */
export const resolveMediaUrl = (url) => {
  if (!url) return url;
  const value = String(url).trim();
  if (!value) return value;
  if (/^(https?:|data:|blob:)/i.test(value)) return value;
  if (value.startsWith("/uploads/")) {
    const origin = getMediaOrigin();
    return origin ? `${origin}${value}` : value;
  }
  return value;
};

/** First usable product/order-item image, or the provided fallback. */
export const getProductImage = (source, fallback = "") => {
  if (!source) return resolveMediaUrl(fallback) || fallback;
  if (typeof source === "string") {
    return resolveMediaUrl(source) || fallback;
  }
  const raw =
    source.image ||
    source.productImage ||
    source.imageUrl ||
    source.images?.[0] ||
    source.product?.images?.[0] ||
    source.product?.image ||
    fallback;
  return resolveMediaUrl(raw) || fallback;
};

/** Resolve a user's profile image URL from common API/legacy field names. */
export const getUserAvatarUrl = (user) => {
  if (!user) return null;
  if (typeof user === "string") return resolveMediaUrl(user) || null;
  const raw = user.avatarUrl || user.avatar || user.image || null;
  return resolveMediaUrl(raw) || null;
};

/** True when API marks the account as Google-authenticated. */
export const isGoogleVerifiedUser = (user) => {
  if (!user) return false;
  if (typeof user.isGoogleVerified === "boolean") return user.isGoogleVerified;
  return String(user.authProvider || "").toUpperCase() === "GOOGLE";
};

/** Human-readable auth provider label for admin/profile UI. */
export const getAuthProviderLabel = (user) => {
  if (!user) return "Manual";
  const provider = String(user.authProvider || "").toUpperCase();
  if (provider === "GOOGLE" || user.isGoogleVerified) return "Google";
  return "Manual";
};

/** Initials for avatar fallback (e.g. "Sam Rivera" → "SR"). */
export const getInitials = (name = "") => {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

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
