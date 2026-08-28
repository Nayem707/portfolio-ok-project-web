import { Link } from "react-router-dom";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

export default function SectionHeader({
  title,
  subtitle,
  to,
  linkLabel = "View all",
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
          {title}
        </h2>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {to && (
        <Link
          to={to}
          className="flex shrink-0 items-center gap-1.5 text-sm font-medium text-primary-600 transition hover:text-primary-700"
        >
          {linkLabel}
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
