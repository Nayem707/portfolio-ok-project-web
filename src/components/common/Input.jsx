import { forwardRef, useId } from "react";
import { classNames } from "@/utils";

const Input = forwardRef(function Input(
  { label, error, hint, className, id, leftIcon: LeftIcon, ...props },
  ref,
) {
  const generatedId = useId();
  const inputId = id || generatedId;
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {LeftIcon && (
          <LeftIcon className="pointer-events-none absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
        )}
        <input
          ref={ref}
          id={inputId}
          className={classNames(
            "input-base",
            LeftIcon && "pl-10",
            error && "border-red-400 focus:border-red-500 focus:ring-red-100",
            className,
          )}
          aria-invalid={!!error}
          {...props}
        />
      </div>
      {error ? (
        <p className="mt-1.5 text-xs text-red-600">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-slate-400">{hint}</p>
      ) : null}
    </div>
  );
});

export default Input;
