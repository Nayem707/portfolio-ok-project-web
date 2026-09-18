import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { classNames } from "@/utils";

export default function Dropdown({
  trigger,
  children,
  align = "right",
  className,
  open: controlledOpen,
  onOpenChange,
  closeOnSelect = true,
  portal = false,
  disabled = false,
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const setOpen = (next) => {
    const value = typeof next === "function" ? next(open) : next;
    if (!isControlled) setUncontrolledOpen(value);
    onOpenChange?.(value);
  };

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e) => {
      const inTrigger = containerRef.current?.contains(e.target);
      const inMenu = menuRef.current?.contains(e.target);
      if (!inTrigger && !inMenu) setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  useLayoutEffect(() => {
    if (!open || !portal) return;

    const updatePosition = () => {
      const triggerEl = triggerRef.current;
      const menuEl = menuRef.current;
      if (!triggerEl) return;

      const rect = triggerEl.getBoundingClientRect();
      const menuWidth = menuEl?.offsetWidth || 192;
      const menuHeight = menuEl?.offsetHeight || 0;
      const gap = 8;
      const spaceBelow = window.innerHeight - rect.bottom - gap;
      const openUp = menuHeight > 0 && spaceBelow < menuHeight && rect.top > spaceBelow;

      let top = openUp ? rect.top - menuHeight - gap : rect.bottom + gap;
      let left =
        align === "right" ? rect.right - menuWidth : rect.left;

      left = Math.min(
        Math.max(8, left),
        window.innerWidth - menuWidth - 8,
      );
      top = Math.min(
        Math.max(8, top),
        window.innerHeight - Math.min(menuHeight || 200, window.innerHeight - 16),
      );

      setCoords({ top, left });
    };

    updatePosition();
    const frame = requestAnimationFrame(updatePosition);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, portal, align]);

  const menu = open ? (
    <div
      ref={menuRef}
      role="menu"
      className={classNames(
        "animate-fade-in z-50 min-w-[12rem] overflow-hidden rounded-xl border border-slate-100 bg-white py-1.5 shadow-lg",
        portal
          ? "fixed"
          : classNames(
              "absolute mt-2",
              align === "right" ? "right-0" : "left-0",
            ),
        className,
      )}
      style={
        portal
          ? { top: coords.top, left: coords.left }
          : undefined
      }
      onClick={() => {
        if (closeOnSelect) setOpen(false);
      }}
    >
      {children}
    </div>
  ) : null;

  return (
    <div className="relative inline-flex" ref={containerRef}>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        className="flex items-center disabled:cursor-not-allowed disabled:opacity-60"
        aria-haspopup="true"
        aria-expanded={open}
      >
        {trigger}
      </button>
      {portal && menu ? createPortal(menu, document.body) : menu}
    </div>
  );
}

export function DropdownItem({ children, className, disabled, ...props }) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      className={classNames(
        "flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-transparent disabled:hover:text-slate-600",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
