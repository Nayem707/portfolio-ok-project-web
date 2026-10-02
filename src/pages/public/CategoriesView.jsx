import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  FireIcon,
  ShoppingBagIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";
import Breadcrumb from "@/components/common/Breadcrumb";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import {
  fetchCategories,
  selectCategories,
  selectCategoriesError,
  selectCategoriesLoading,
} from "@/features/categories";
import { getCategoryLabel, resolveMediaUrl } from "@/utils";

const FALLBACK_CATEGORY_IMAGE =
  "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&q=80";

const productCountOf = (category) => category._count?.products ?? 0;

const formatProductCount = (count) =>
  `${count} ${count === 1 ? "product" : "products"}`;

const handleImageError = (e) => {
  if (e.currentTarget.src !== FALLBACK_CATEGORY_IMAGE)
    e.currentTarget.src = FALLBACK_CATEGORY_IMAGE;
};

export default function CategoriesView() {
  const dispatch = useDispatch();
  const categories = useSelector(selectCategories);
  const loading = useSelector(selectCategoriesLoading);
  const error = useSelector(selectCategoriesError);

  const { totalProducts, topCategory, featured } = useMemo(() => {
    const byPopularity = [...categories].sort(
      (a, b) => productCountOf(b) - productCountOf(a),
    );
    return {
      totalProducts: categories.reduce(
        (sum, cat) => sum + productCountOf(cat),
        0,
      ),
      topCategory:
        byPopularity[0] && productCountOf(byPopularity[0]) > 0
          ? byPopularity[0]
          : null,
      featured: byPopularity.slice(0, 3),
    };
  }, [categories]);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  if (loading) {
    return <LoadingSpinner className="py-16" label="Loading categories..." />;
  }

  if (error) {
    return (
      <div className="container-app py-8">
        <div className="mx-auto w-full max-w-7xl">
          <ErrorState
            title="Could not load categories"
            description={error}
            onRetry={() => dispatch(fetchCategories())}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container-app py-8">
      <div className="mx-auto w-full max-w-7xl">
        <Breadcrumb items={[{ label: "Categories" }]} />
        <section className="from-primary-600 to-primary-800 relative mt-6 overflow-hidden rounded-2xl bg-linear-to-br px-6 py-10 text-white sm:px-10 sm:py-12">
          <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-white/5" />

          <div className="relative grid items-center gap-10 lg:grid-cols-[1fr_auto]">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold tracking-widest text-yellow-400 uppercase sm:text-sm">
                Shop by category
              </p>
              <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
                Browse Categories
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-white/80 sm:text-base">
                Find exactly what you need, faster. Explore our collections
                below and tap any category to see all of its products.
              </p>

              <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-white/10 px-4 py-3 ring-1 ring-white/20">
                  <dt className="flex items-center gap-1.5 text-xs text-white/70">
                    <Squares2X2Icon className="h-4 w-4" />
                    Categories
                  </dt>
                  <dd className="mt-1 text-2xl font-bold">
                    {categories.length}
                  </dd>
                </div>
                <div className="rounded-xl bg-white/10 px-4 py-3 ring-1 ring-white/20">
                  <dt className="flex items-center gap-1.5 text-xs text-white/70">
                    <ShoppingBagIcon className="h-4 w-4" />
                    Products
                  </dt>
                  <dd className="mt-1 text-2xl font-bold">{totalProducts}</dd>
                </div>
                {topCategory && (
                  <div className="col-span-2 rounded-xl bg-white/10 px-4 py-3 ring-1 ring-white/20 sm:col-span-1">
                    <dt className="flex items-center gap-1.5 text-xs text-white/70">
                      <FireIcon className="h-4 w-4" />
                      Most popular
                    </dt>
                    <dd className="mt-1 truncate text-base font-semibold">
                      {getCategoryLabel(topCategory)}
                    </dd>
                    <dd className="text-xs text-white/70">
                      {formatProductCount(productCountOf(topCategory))}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {featured.length > 0 && (
              <div className="hidden -space-x-6 lg:flex">
                {featured.map((cat) => (
                  <span
                    key={cat.id}
                    className="block h-28 w-28 overflow-hidden rounded-full border-4 border-white/90 bg-white shadow-lg"
                  >
                    <img
                      src={
                        resolveMediaUrl(cat.image) || FALLBACK_CATEGORY_IMAGE
                      }
                      alt=""
                      onError={handleImageError}
                      className="h-full w-full object-cover"
                    />
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>

        {categories.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              title="No categories available"
              description="Categories will appear here when available."
            />
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/products?category=${encodeURIComponent(cat.slug || cat.id)}`}
                className="group flex flex-col items-center text-center"
              >
                <span className="group-hover:border-primary-600 block aspect-square w-full max-w-48 rounded-full border-2 border-slate-200 bg-white p-2 transition">
                  <span className="block h-full w-full overflow-hidden rounded-full bg-slate-100">
                    <img
                      src={
                        resolveMediaUrl(cat.image) || FALLBACK_CATEGORY_IMAGE
                      }
                      alt={getCategoryLabel(cat)}
                      loading="lazy"
                      onError={handleImageError}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  </span>
                </span>
                <h3 className="group-hover:text-primary-600 mt-4 text-sm font-semibold text-slate-900 transition sm:text-base">
                  {getCategoryLabel(cat)}
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  {formatProductCount(productCountOf(cat))}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
