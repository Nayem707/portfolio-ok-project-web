import {
  ArrowPathIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";

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

export default function PerksSection() {
  return (
    <section className="border-b border-slate-200 bg-white">
      <div className="container-app grid grid-cols-2 gap-4 py-6 lg:grid-cols-4">
        {perks.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex items-center gap-3">
            <span className="bg-primary-50 text-primary-600 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg">
              <Icon className="h-6 w-6" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-800">{title}</p>
              <p className="text-xs text-slate-500">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
