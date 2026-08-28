import { StarIcon } from "@heroicons/react/24/solid";
import { classNames } from "@/utils";

export default function Rating({
  value = 0,
  reviews,
  size = "sm",
  showValue = true,
}) {
  const dims = { sm: "h-4 w-4", md: "h-5 w-5" };
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            className={classNames(
              dims[size],
              star <= Math.round(value) ? "text-amber-400" : "text-slate-200",
            )}
          />
        ))}
      </div>
      {showValue && (
        <span className="text-xs font-medium text-slate-600">
          {value.toFixed(1)}
          {reviews != null && (
            <span className="ml-1 text-slate-400">({reviews})</span>
          )}
        </span>
      )}
    </div>
  );
}
