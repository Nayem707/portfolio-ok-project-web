import { classNames } from "@/utils";

export default function Tabs({ tabs = [], active, onChange, className }) {
  return (
    <div className={classNames("border-b border-slate-200", className)}>
      <nav
        className="no-scrollbar -mb-px flex gap-6 overflow-x-auto"
        aria-label="Tabs"
      >
        {tabs.map((tab) => {
          const value = tab.value ?? tab;
          const label = tab.label ?? tab;
          const isActive = value === active;
          const Icon = tab.icon;
          return (
            <button
              key={value}
              onClick={() => onChange(value)}
              className={classNames(
                "inline-flex items-center gap-2 border-b-2 px-1 py-3 text-sm font-medium whitespace-nowrap transition",
                isActive
                  ? "border-primary-600 text-primary-700"
                  : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700",
              )}
              aria-current={isActive ? "page" : undefined}
            >
              {Icon && <Icon className="h-4.5 w-4.5" aria-hidden="true" />}
              {label}
              {tab.count != null && (
                <span
                  className={classNames(
                    "rounded-full px-2 py-0.5 text-xs",
                    isActive
                      ? "bg-primary-100 text-primary-700"
                      : "bg-slate-100 text-slate-500",
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
