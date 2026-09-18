import { useEffect, useState } from "react";
import { getInitials, getUserAvatarUrl, classNames } from "@/utils";

const SIZE_CLASSES = {
  xs: "h-7 w-7 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-20 w-20 text-xl",
  "2xl": "h-24 w-24 text-2xl",
};

/**
 * Profile avatar with image URL support and initials fallback
 * when the URL is missing or fails to load.
 */
export default function Avatar({
  user,
  src,
  name,
  alt,
  size = "md",
  className = "",
}) {
  const resolvedSrc = src ?? getUserAvatarUrl(user);
  const displayName = name || user?.name || "";
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [resolvedSrc]);

  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;
  const label = alt || displayName || "User avatar";

  if (!resolvedSrc || failed) {
    return (
      <span
        role="img"
        aria-label={label}
        title={displayName || undefined}
        className={classNames(
          "inline-flex shrink-0 items-center justify-center rounded-full bg-slate-200 font-semibold text-slate-600",
          sizeClass,
          className,
        )}
      >
        {getInitials(displayName)}
      </span>
    );
  }

  return (
    <img
      src={resolvedSrc}
      alt={label}
      title={displayName || undefined}
      onError={() => setFailed(true)}
      className={classNames(
        "inline-block shrink-0 rounded-full object-cover",
        sizeClass,
        className,
      )}
    />
  );
}
