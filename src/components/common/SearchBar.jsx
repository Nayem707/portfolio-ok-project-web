import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { classNames } from "@/utils";

export default function SearchBar({
  placeholder = "Search products…",
  className,
  onSubmit,
  autoFocus = false,
}) {
  const [value, setValue] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const q = value.trim();
    if (onSubmit) {
      onSubmit(q);
    } else {
      navigate(q ? `/products?search=${encodeURIComponent(q)}` : "/products");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={classNames("relative w-full", className)}
      role="search"
    >
      <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
      <input
        type="search"
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-10 text-sm text-slate-800 placeholder:text-slate-400 transition focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100"
        aria-label="Search"
      />
      {value && (
        <button
          type="button"
          onClick={() => setValue("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-slate-400 hover:bg-slate-200"
          aria-label="Clear search"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      )}
    </form>
  );
}
