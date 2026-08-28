import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import Button from "@/components/common/Button";

export default function ErrorState({
  title = "Something went wrong",
  description = "We couldn’t load this content. Please try again.",
  onRetry,
  className,
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl border border-red-100 bg-red-50/40 px-6 py-14 text-center ${className || ""}`}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
        <ExclamationCircleIcon className="h-7 w-7 text-red-600" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-800">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>
      {onRetry && (
        <Button variant="outline" className="mt-5" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
