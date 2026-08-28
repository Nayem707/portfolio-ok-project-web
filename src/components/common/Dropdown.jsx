import { useEffect, useRef, useState } from "react";
import { classNames } from "@/utils";

export default function Dropdown({
  trigger,
  children,
  align = "right",
  className,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center"
        aria-haspopup="true"
        aria-expanded={open}
      >
        {trigger}
      </button>
      {open && (
        <div
          className={classNames(
            "absolute z-40 mt-2 min-w-[12rem] animate-fade-in overflow-hidden rounded-xl border border-slate-100 bg-white py-1.5 shadow-lg",
            align === "right" ? "right-0" : "left-0",
            className,
          )}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function DropdownItem({ children, className, ...props }) {
  return (
    <button
      className={classNames(
        "flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm text-slate-600 transition hover:bg-slate-50 hover:text-slate-900",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
