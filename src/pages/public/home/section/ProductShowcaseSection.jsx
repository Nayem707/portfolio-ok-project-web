import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRightIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";
import ProductGrid from "@/components/product/ProductGrid";
import { getProductImage } from "@/utils";

export const SECTION_BANNER_ACTION_CLASS =
  "from-primary-700 to-primary-500 hover:from-primary-800 hover:to-primary-600 shadow-primary-500/30 flex shrink-0 items-center gap-2 rounded-full bg-linear-to-r py-1.5 pr-1.5 pl-4 text-xs font-semibold text-white shadow-md transition sm:text-sm";

export function SectionBanner({
  title,
  subtitle,
  to,
  image,
  icon: Icon = ShoppingBagIcon,
  action,
}) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div className="border-primary-100 from-primary-50 to-accent-50/60 mb-6 flex items-center gap-3 rounded-2xl border bg-linear-to-r via-white px-3 py-3 shadow-sm sm:gap-4 sm:px-5">
      <div className="bg-primary-100 flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full shadow-sm ring-2 ring-white sm:h-14 sm:w-14">
        {image && !imageFailed ? (
          <img
            src={image}
            alt=""
            className="h-full w-full object-cover"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <Icon className="text-primary-600 h-6 w-6" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h2 className="truncate text-base font-bold text-slate-900 sm:text-lg">
          {title}
        </h2>
        {subtitle && (
          <p className="truncate text-xs text-slate-500 sm:text-sm">
            {subtitle}
          </p>
        )}
      </div>

      {action}
      {to && !action && (
        <Link to={to} className={SECTION_BANNER_ACTION_CLASS}>
          View all
          <span className="text-primary-700 flex h-6 w-6 items-center justify-center rounded-full bg-white">
            <ArrowRightIcon className="h-3.5 w-3.5" />
          </span>
        </Link>
      )}
    </div>
  );
}

export default function ProductShowcaseSection({
  title,
  subtitle,
  to,
  products,
  loading = false,
}) {
  const image = getProductImage(products?.[0]);

  return (
    <section>
      <SectionBanner
        key={image}
        title={title}
        subtitle={subtitle}
        to={to}
        image={image}
      />
      <ProductGrid products={products} loading={loading} skeletonCount={4} />
    </section>
  );
}
