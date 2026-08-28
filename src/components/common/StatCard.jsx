import { classNames } from "@/utils";

const tones = {
  primary: "bg-primary-50 text-primary-600",
  green: "bg-emerald-50 text-emerald-600",
  yellow: "bg-amber-50 text-amber-600",
  blue: "bg-blue-50 text-blue-600",
  purple: "bg-purple-50 text-purple-600",
  orange: "bg-orange-50 text-orange-600",
};

export default function StatCard({
  label,
  value,
  icon: Icon,
  tone = "primary",
  trend,
}) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-1.5 text-2xl font-bold text-slate-900">{value}</p>
          {trend && (
            <p
              className={classNames(
                "mt-1 text-xs font-medium",
                trend.positive ? "text-emerald-600" : "text-red-500",
              )}
            >
              {trend.positive ? "↑" : "↓"} {trend.value}{" "}
              <span className="text-slate-400">{trend.label}</span>
            </p>
          )}
        </div>
        {Icon && (
          <span
            className={classNames(
              "flex h-11 w-11 items-center justify-center rounded-lg",
              tones[tone],
            )}
          >
            <Icon className="h-6 w-6" />
          </span>
        )}
      </div>
    </div>
  );
}
