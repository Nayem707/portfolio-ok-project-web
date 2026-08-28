import { classNames } from "@/utils";

const colors = {
  gray: "bg-slate-100 text-slate-700 ring-slate-200",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  red: "bg-red-50 text-red-700 ring-red-200",
  yellow: "bg-amber-50 text-amber-700 ring-amber-200",
  blue: "bg-blue-50 text-blue-700 ring-blue-200",
  indigo: "bg-primary-50 text-primary-700 ring-primary-200",
  orange: "bg-orange-50 text-orange-700 ring-orange-200",
  purple: "bg-purple-50 text-purple-700 ring-purple-200",
};

export default function Badge({
  children,
  color = "gray",
  className,
  dot = false,
}) {
  return (
    <span
      className={classNames(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        colors[color] || colors.gray,
        className,
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}
