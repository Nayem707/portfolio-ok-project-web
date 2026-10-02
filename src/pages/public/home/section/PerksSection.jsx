import {
  ArrowPathIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";
import { classNames } from "@/utils";

const perks = [
  { icon: TruckIcon, title: "Free Shipping", desc: "On orders over $150" },
  { icon: ArrowPathIcon, title: "Easy Returns", desc: "30-day return policy" },
  {
    icon: ShieldCheckIcon,
    title: "Secure Payments",
    desc: "Protected checkout",
  },
  { icon: CreditCardIcon, title: "Flexible Payment", desc: "Multiple methods" },
];

const iconByName = {
  TruckIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  CreditCardIcon,
};

export default function PerksSection({
  perks: incomingPerks = perks,
  className = "border-b border-slate-200",
}) {
  const resolvedPerks = (incomingPerks || [])
    .filter((item) => item?.active !== false)
    .map((item) => ({
      ...item,
      icon:
        typeof item.icon === "string"
          ? iconByName[item.icon] || TruckIcon
          : item.icon || TruckIcon,
      desc: item.desc || item.description,
    }));

  const finalPerks = resolvedPerks.length > 0 ? resolvedPerks : perks;

  return (
    <section className={classNames("bg-primary-800", className)}>
      <div className="container-app">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 py-6 lg:grid-cols-4">
          {finalPerks.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-center gap-3">
              <span className="bg-primary-50 text-primary-600 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg">
                <Icon className="h-6 w-6" />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-100">{title}</p>
                <p className="text-xs text-slate-200">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
