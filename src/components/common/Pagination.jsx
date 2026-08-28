import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { classNames } from "@/utils";

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const push = (p) => pages.push(p);
  push(1);
  for (let i = page - 1; i <= page + 1; i += 1) {
    if (i > 1 && i < totalPages) push(i);
  }
  if (totalPages > 1) push(totalPages);
  const unique = [...new Set(pages)].sort((a, b) => a - b);

  const withEllipsis = [];
  unique.forEach((p, idx) => {
    if (idx > 0 && p - unique[idx - 1] > 1) withEllipsis.push("…");
    withEllipsis.push(p);
  });

  return (
    <nav
      className="flex items-center justify-center gap-1.5"
      aria-label="Pagination"
    >
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 disabled:opacity-40"
        aria-label="Previous page"
      >
        <ChevronLeftIcon className="h-4 w-4" />
      </button>
      {withEllipsis.map((p, idx) =>
        p === "…" ? (
          <span key={`e-${idx}`} className="px-2 text-slate-400">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={classNames(
              "flex h-9 min-w-9 items-center justify-center rounded-lg border px-3 text-sm font-medium transition",
              p === page
                ? "border-primary-600 bg-primary-600 text-white"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
            )}
            aria-current={p === page ? "page" : undefined}
          >
            {p}
          </button>
        ),
      )}
      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 disabled:opacity-40"
        aria-label="Next page"
      >
        <ChevronRightIcon className="h-4 w-4" />
      </button>
    </nav>
  );
}
