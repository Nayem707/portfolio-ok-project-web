import { Link } from "react-router-dom";
import { ChevronRightIcon, HomeIcon } from "@heroicons/react/24/outline";

export default function Breadcrumb({ items = [] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center text-sm">
      <ol className="flex flex-wrap items-center gap-1.5 text-slate-500">
        <li>
          <Link
            to="/"
            className="flex items-center hover:text-primary-600"
            aria-label="Home"
          >
            <HomeIcon className="h-4 w-4" />
          </Link>
        </li>
        {items.map((item, idx) => {
          const last = idx === items.length - 1;
          return (
            <li key={idx} className="flex items-center gap-1.5">
              <ChevronRightIcon className="h-3.5 w-3.5 text-slate-300" />
              {last || !item.to ? (
                <span className="font-medium text-slate-700">{item.label}</span>
              ) : (
                <Link to={item.to} className="hover:text-primary-600">
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
