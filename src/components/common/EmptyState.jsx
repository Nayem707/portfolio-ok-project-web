import { InboxIcon } from "@heroicons/react/24/outline";

export default function EmptyState({
  icon: Icon = InboxIcon,
  title = "Nothing here yet",
  description,
  action,
  className,
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center ${className || ""}`}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
        <Icon className="h-7 w-7 text-slate-400" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-800">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
