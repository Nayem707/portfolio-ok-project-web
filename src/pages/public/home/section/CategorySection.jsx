import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import { PUBLIC_PATHS } from "@/routes/public/public.paths";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorState from "@/components/common/ErrorState";
import EmptyState from "@/components/common/EmptyState";
import { classNames, getCategoryLabel, resolveMediaUrl } from "@/utils";

const FALLBACK_CATEGORY_IMAGE =
  "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&q=80";

const handleImageError = (e) => {
  if (e.currentTarget.src !== FALLBACK_CATEGORY_IMAGE)
    e.currentTarget.src = FALLBACK_CATEGORY_IMAGE;
};

function CategorySlide({ category, productCount }) {
  const targetCategory = category.slug || category.id;

  return (
    <Link
      to={`/products?category=${encodeURIComponent(targetCategory)}`}
      className="group border-primary-100 hover:border-primary-300 relative flex w-36 shrink-0 snap-start flex-col items-center rounded-2xl border bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:w-44"
    >
      {productCount > 0 && (
        <span
          className="bg-primary-50 text-primary-700 absolute top-2 right-2 z-10 rounded-full px-2 py-0.5 text-[11px] font-semibold"
          title={`${productCount} ${productCount === 1 ? "product" : "products"}`}
        >
          {productCount}+
        </span>
      )}

      <span className="from-primary-600 via-primary-400 to-accent-400 block w-full rounded-full bg-linear-to-br p-[3px]">
        <span className="block aspect-square w-full overflow-hidden rounded-full border-2 border-white bg-slate-100">
          <img
            src={resolveMediaUrl(category.image) || FALLBACK_CATEGORY_IMAGE}
            alt={getCategoryLabel(category)}
            loading="lazy"
            onError={handleImageError}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        </span>
      </span>

      <span className="bg-primary-50 text-primary-600 mt-3 flex h-7 w-7 items-center justify-center rounded-full">
        <TagIcon className="h-4 w-4" />
      </span>
      <h3 className="group-hover:text-primary-600 mt-1.5 line-clamp-1 w-full text-center text-sm font-semibold text-slate-800">
        {getCategoryLabel(category)}
      </h3>
    </Link>
  );
}

export default function CategorySection({
  categories,
  categoryCounts,
  title,
  subtitle,
  loading,
  error,
  onRetry,
}) {
  const trackRef = useRef(null);
  const [canScroll, setCanScroll] = useState({ left: false, right: false });

  const updateArrows = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanScroll({
      left: el.scrollLeft > 4,
      right: el.scrollLeft + el.clientWidth < el.scrollWidth - 4,
    });
  }, []);

  useEffect(() => {
    updateArrows();
    window.addEventListener("resize", updateArrows);
    return () => window.removeEventListener("resize", updateArrows);
  }, [updateArrows, categories.length, loading]);

  const scrollBy = (direction) => {
    const el = trackRef.current;
    if (el)
      el.scrollBy({
        left: direction * el.clientWidth * 0.8,
        behavior: "smooth",
      });
  };

  return (
    <section className="border-primary-100 from-primary-50 to-accent-50/60 rounded-3xl border bg-linear-to-br via-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch">
        <div className="lg:border-primary-100 flex shrink-0 flex-col lg:w-60 lg:border-r lg:pr-6">
          <span className="border-primary-200 text-primary-700 self-start rounded-full border bg-white px-3 py-1 text-xs font-semibold">
            Browse categories
          </span>
          <h2 className="mt-3 text-2xl leading-tight font-bold text-slate-900 sm:text-3xl">
            {title || "Shop by Category"}
          </h2>
          <span className="from-primary-600 to-accent-500 mt-3 block h-1 w-12 rounded-full bg-linear-to-r" />
          <p className="mt-3 text-sm leading-relaxed text-slate-500">
            {subtitle || "Find exactly what you’re looking for"}
          </p>
          <Link
            to={PUBLIC_PATHS.CATEGORIES}
            className="from-primary-700 to-primary-500 shadow-primary-500/30 hover:from-primary-800 hover:to-primary-600 mt-5 inline-flex items-center gap-2 self-start rounded-xl bg-linear-to-r px-5 py-3 text-sm font-semibold text-white shadow-lg transition lg:mt-auto"
          >
            View all categories
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>

        <div className="relative min-w-0 flex-1">
          {loading ? (
            <LoadingSpinner className="py-12" label="Loading categories..." />
          ) : error ? (
            <ErrorState
              title="Could not load categories"
              description={error}
              onRetry={onRetry}
            />
          ) : categories.length === 0 ? (
            <EmptyState
              title="No categories available"
              description="Categories will appear here when available."
            />
          ) : (
            <>
              <div
                ref={trackRef}
                onScroll={updateArrows}
                className="flex snap-x snap-mandatory [scrollbar-width:none] gap-3 overflow-x-auto scroll-smooth py-1 sm:gap-4 [&::-webkit-scrollbar]:hidden"
              >
                {categories.map((category) => (
                  <CategorySlide
                    key={category.id}
                    category={category}
                    productCount={
                      categoryCounts[category.name] ??
                      category._count?.products ??
                      0
                    }
                  />
                ))}
              </div>

              {[
                {
                  dir: -1,
                  show: canScroll.left,
                  Icon: ChevronLeftIcon,
                  label: "Previous categories",
                  side: "left-1",
                },
                {
                  dir: 1,
                  show: canScroll.right,
                  Icon: ChevronRightIcon,
                  label: "Next categories",
                  side: "right-1",
                },
              ].map(({ dir, show, Icon, label, side }) => (
                <button
                  key={dir}
                  type="button"
                  onClick={() => scrollBy(dir)}
                  aria-label={label}
                  className={classNames(
                    "hover:text-primary-600 absolute top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-md transition",
                    side,
                    show ? "opacity-100" : "pointer-events-none opacity-0",
                  )}
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
