import { Link } from "react-router-dom";
import { ShoppingBagIcon } from "@heroicons/react/24/solid";
import { APP_NAME } from "@/constants";
import { classNames } from "@/utils";

export default function Logo({ className, textClassName, to = "/" }) {
  return (
    <Link to={to} className={classNames("flex items-center gap-2", className)}>
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white shadow-sm">
        <ShoppingBagIcon className="h-5 w-5" />
      </span>
      <span
        className={classNames(
          "text-xl font-extrabold tracking-tight text-slate-900",
          textClassName,
        )}
      >
        {APP_NAME}
      </span>
    </Link>
  );
}
