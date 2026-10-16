const AUTH_PAGES = ["/login", "/register", "/forgot-password"];

/** Same-origin app path only (blocks `//evil.com`, `/\evil.com`, absolute URLs). */
export const toSafeRedirectPath = (value) => {
  if (typeof value !== "string") return null;
  const path = value.trim();
  if (
    !path.startsWith("/") ||
    path.startsWith("//") ||
    path.startsWith("/\\")
  ) {
    return null;
  }
  const pathname = path.split(/[?#]/)[0];
  if (AUTH_PAGES.includes(pathname)) return null;
  return path;
};

/** Destination to return to after login/register: router state first, then `?redirect=`. */
export const getAuthRedirect = (location) => {
  const from = location?.state?.from;
  const fromState =
    typeof from === "string"
      ? from
      : from?.pathname
        ? `${from.pathname}${from.search || ""}`
        : null;
  const fromQuery = new URLSearchParams(location?.search || "").get("redirect");
  return toSafeRedirectPath(fromState) || toSafeRedirectPath(fromQuery);
};

export const buildLoginUrl = (redirectPath) => {
  const safe = toSafeRedirectPath(redirectPath);
  return safe ? `/login?redirect=${encodeURIComponent(safe)}` : "/login";
};
