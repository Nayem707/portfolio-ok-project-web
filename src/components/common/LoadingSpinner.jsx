import { classNames } from "@/utils";

export default function LoadingSpinner({ size = "md", className, label }) {
  const sizes = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-2",
    lg: "h-12 w-12 border-[3px]",
  };
  return (
    <div
      className={classNames(
        "flex flex-col items-center justify-center gap-3",
        className,
      )}
    >
      <div
        className={classNames(
          "animate-spin rounded-full border-primary-200 border-t-primary-600",
          sizes[size],
        )}
        role="status"
        aria-label="Loading"
      />
      {label && <p className="text-sm text-slate-500">{label}</p>}
    </div>
  );
}
