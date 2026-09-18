import { CheckBadgeIcon } from "@heroicons/react/24/solid";
import Badge from "@/components/common/Badge";
import { classNames, isGoogleVerifiedUser } from "@/utils";

/**
 * Google Verified indicator from API `isGoogleVerified` / `authProvider`.
 * Renders nothing for manual-auth users.
 */
export default function GoogleVerifiedBadge({
  user,
  variant = "icon",
  className,
}) {
  if (!isGoogleVerifiedUser(user)) return null;

  if (variant === "badge") {
    return (
      <Badge color="blue" className={className}>
        <CheckBadgeIcon className="h-3.5 w-3.5" aria-hidden />
        Google Verified
      </Badge>
    );
  }

  return (
    <span
      className={classNames(
        "inline-flex shrink-0 items-center text-blue-600",
        className,
      )}
      title="Google Verified"
      aria-label="Google Verified"
    >
      <CheckBadgeIcon className="h-4 w-4" aria-hidden />
    </span>
  );
}
