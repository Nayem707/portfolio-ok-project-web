import { forwardRef, useId } from "react";
import { classNames } from "@/utils";

const Select = forwardRef(function Select(
  { label, error, className, id, children, ...props },
  ref,
) {
  const generatedId = useId();
  const selectId = id || generatedId;
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        className={classNames(
          "input-base cursor-pointer appearance-none bg-[length:1.25rem] bg-[right_0.5rem_center] bg-no-repeat pr-9",
          error && "border-red-400 focus:border-red-500 focus:ring-red-100",
          className,
        )}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='2' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5'/%3E%3C/svg%3E\")",
        }}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
});

export default Select;
