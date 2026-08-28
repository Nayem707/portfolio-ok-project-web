import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import { classNames } from "@/utils";

export default function QuantitySelector({
  value = 1,
  onChange,
  min = 1,
  max = 99,
  size = "md",
}) {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));
  const btn = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const text = size === "sm" ? "w-9 text-sm" : "w-12 text-base";

  return (
    <div className="inline-flex items-center rounded-lg border border-slate-300 bg-white">
      <button
        type="button"
        onClick={dec}
        disabled={value <= min}
        className={classNames(
          "flex items-center justify-center rounded-l-lg text-slate-600 transition hover:bg-slate-50 disabled:opacity-40",
          btn,
        )}
        aria-label="Decrease quantity"
      >
        <MinusIcon className="h-4 w-4" />
      </button>
      <span
        className={classNames(
          "select-none text-center font-semibold text-slate-800",
          text,
        )}
      >
        {value}
      </span>
      <button
        type="button"
        onClick={inc}
        disabled={value >= max}
        className={classNames(
          "flex items-center justify-center rounded-r-lg text-slate-600 transition hover:bg-slate-50 disabled:opacity-40",
          btn,
        )}
        aria-label="Increase quantity"
      >
        <PlusIcon className="h-4 w-4" />
      </button>
    </div>
  );
}
