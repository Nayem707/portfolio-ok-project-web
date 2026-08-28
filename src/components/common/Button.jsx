import { forwardRef } from "react";
import { classNames } from "@/utils";

const variants = {
  primary:
    "bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary-500 shadow-sm",
  secondary:
    "bg-slate-100 text-slate-800 hover:bg-slate-200 focus-visible:ring-slate-400",
  outline:
    "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus-visible:ring-slate-400",
  ghost: "text-slate-600 hover:bg-slate-100 focus-visible:ring-slate-300",
  danger:
    "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 shadow-sm",
  accent:
    "bg-accent-500 text-white hover:bg-accent-600 focus-visible:ring-accent-400 shadow-sm",
};

const sizes = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-5 py-3 text-base",
  icon: "p-2",
};

const Button = forwardRef(function Button(
  {
    as: Component = "button",
    variant = "primary",
    size = "md",
    className,
    children,
    loading = false,
    fullWidth = false,
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    disabled,
    ...props
  },
  ref,
) {
  return (
    <Component
      ref={ref}
      disabled={disabled || loading}
      className={classNames(
        "btn",
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {loading && (
        <svg
          className="h-4 w-4 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      )}
      {!loading && LeftIcon && <LeftIcon className="h-4 w-4" />}
      {children}
      {!loading && RightIcon && <RightIcon className="h-4 w-4" />}
    </Component>
  );
});

export default Button;
