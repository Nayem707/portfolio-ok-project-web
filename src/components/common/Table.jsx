import { classNames } from "@/utils";

/**
 * Responsive table. On desktop renders a real <table>; on mobile each row
 * becomes a stacked card via the `renderCard` prop so admin tables stay usable.
 */
export default function Table({
  columns,
  data,
  renderCard,
  emptyState,
  rowKey = "id",
}) {
  if (!data?.length && emptyState) {
    return emptyState;
  }

  return (
    <div>
      {/* Desktop table */}
      <div className="hidden overflow-x-auto rounded-xl border border-slate-200 bg-white md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs tracking-wide text-slate-500 uppercase">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={classNames(
                    "px-5 py-3.5 align-middle font-semibold whitespace-nowrap",
                    col.className,
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row) => (
              <tr key={row[rowKey]} className="transition hover:bg-slate-50/70">
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={classNames(
                      "px-5 py-3.5 align-middle whitespace-nowrap text-slate-700",
                      col.cellClassName,
                    )}
                  >
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {data.map((row) =>
          renderCard ? (
            <div key={row[rowKey]}>{renderCard(row)}</div>
          ) : (
            <div key={row[rowKey]} className="card p-4">
              {columns.map((col) => (
                <div
                  key={col.key}
                  className="flex justify-between gap-4 py-1 text-sm"
                >
                  <span className="text-slate-400">{col.header}</span>
                  <span className="text-right text-slate-700">
                    {col.render ? col.render(row) : row[col.key]}
                  </span>
                </div>
              ))}
            </div>
          ),
        )}
      </div>
    </div>
  );
}
