import { CubeIcon } from "@heroicons/react/24/outline";
import { classNames } from "@/utils";

/**
 * Read-only display of a selected package (name + optional components).
 * Used in the mini cart, cart, checkout summary and order views so the
 * chosen bundle is visible everywhere the customer reviews their items.
 */
export default function PackageTag({
  name,
  components,
  showComponents = false,
  className,
}) {
  if (!name) return null;

  const parts = Array.isArray(components)
    ? components
        .filter(Boolean)
        .map((c) =>
          Number(c.quantity) > 1 ? `${c.name} × ${c.quantity}` : c.name,
        )
    : [];

  return (
    <div className={classNames("flex flex-col gap-1", className)}>
      <span className="bg-primary-50 text-primary-700 border-primary-100 inline-flex w-fit items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium">
        <CubeIcon className="h-3 w-3" />
        {name}
      </span>
      {showComponents && parts.length > 0 && (
        <span className="text-[11px] text-slate-500">{parts.join(", ")}</span>
      )}
    </div>
  );
}
