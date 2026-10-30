import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
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
import { classNames, getCategoryLabel, resolveMediaUrl } from "@/utils";

const FALLBACK_CATEGORY_IMAGE =
  "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&q=80";

const productCountOf = (category) => category._count?.products ?? 0;
const subcategoryCountOf = (subcategory) => subcategory._count?.products ?? 0;

const formatProductCount = (count) =>
  `${count} ${count === 1 ? "product" : "products"}`;

const handleImageError = (e) => {
  if (e.currentTarget.src !== FALLBACK_CATEGORY_IMAGE) {
    e.currentTarget.src = FALLBACK_CATEGORY_IMAGE;
  }
};

export default function CategoriesView() {
  const dispatch = useDispatch();
  const categories = useSelector(selectCategories);
  const categoriesLoading = useSelector(selectCategoriesLoading);
  const categoriesError = useSelector(selectCategoriesError);
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedCategoryKey = searchParams.get("category") || "";
  const selectedSubcategoryKey = searchParams.get("subcategory") || "";

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

  const selectedMainCategory = useMemo(
    () =>
      categories.find(
        (cat) =>
          cat.id === selectedCategoryKey || cat.slug === selectedCategoryKey,
      ) || null,
    [categories, selectedCategoryKey],
  );

  const selectedSubcategory = useMemo(
    () =>
      selectedMainCategory?.subcategories?.find(
        (subcat) =>
          subcat.id === selectedSubcategoryKey ||
          subcat.slug === selectedSubcategoryKey,
      ) || null,
    [selectedMainCategory, selectedSubcategoryKey],
  );

  const selectedMainSubcategories = Array.isArray(selectedMainCategory?.subcategories)
    ? selectedMainCategory.subcategories
    : [];

  const selectedMainTitle = selectedMainCategory
    ? getCategoryLabel(selectedMainCategory)
    : "All Categories";
  const selectedSubTitle = selectedSubcategory
    ? selectedSubcategory.title || selectedSubcategory.name
    : "";

  const updateParams = (patch) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") next.delete(key);
      else next.set(key, String(value));
    });
    setSearchParams(next);
  };

  const selectMainCategory = (categoryKey) => {
    if (!categoryKey) {
      updateParams({
        category: "",
        subcategory: "",
      });
      return;
    }
    updateParams({
      category: categoryKey,
      subcategory: "",
    });
  };

  const selectSubcategory = (subcategoryKey) => {
    updateParams({
      subcategory: subcategoryKey || "",
    });
  };

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  if (categoriesLoading) {
    return <LoadingSpinner className="py-16" label="Loading categories..." />;
  }

  if (categoriesError) {
    return (
      <div className="container-app py-8">
        <div className="mx-auto w-full max-w-7xl">
          <ErrorState
            title="Could not load categories"
            description={categoriesError}
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

        <div className="mt-6 overflow-x-auto">
          <div className="flex min-w-max items-center gap-2 pb-1">
            <button
              type="button"
              onClick={() => selectMainCategory("")}
              className={classNames(
                "rounded-full border px-4 py-2 text-sm font-medium transition",
                !selectedMainCategory
                  ? "border-primary-600 bg-primary-600 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
              )}
            >
              All
            </button>
            {categories.map((cat) => {
              const selected = selectedMainCategory?.id === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => selectMainCategory(cat.slug || cat.id)}
                  className={classNames(
                    "rounded-full border px-4 py-2 text-sm font-medium transition",
                    selected
                      ? "border-primary-600 bg-primary-600 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                  )}
                >
                  {getCategoryLabel(cat)}
                </button>
              );
            })}
          </div>
        </div>

        {categories.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              title="No categories available"
              description="Categories will appear here when available."
            />
          </div>
        ) : selectedMainCategory ? (
          <div className="mt-10">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-slate-900">
                {selectedMainTitle}
              </h2>
              {selectedSubcategory && (
                <button
                  type="button"
                  onClick={() => selectSubcategory("")}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Back to {selectedMainTitle}
                </button>
              )}
            </div>

            {selectedMainSubcategories.length > 0 ? (
              <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
                {selectedMainSubcategories.map((subcat) => {
                  const selected = selectedSubcategory?.id === subcat.id;
                  return (
                    <button
                      key={subcat.id}
                      type="button"
                      onClick={() => selectSubcategory(subcat.slug || subcat.id)}
                      className={classNames(
                        "card group p-5 text-left transition hover:-translate-y-0.5 hover:shadow-lg",
                        selected ? "ring-primary-500 ring-2" : "",
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <span className="block h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5">
                          <img
                            src={
                              resolveMediaUrl(subcat.image) ||
                              resolveMediaUrl(selectedMainCategory.image) ||
                              FALLBACK_CATEGORY_IMAGE
                            }
                            alt={subcat.title || subcat.name}
                            loading="lazy"
                            onError={handleImageError}
                            className="h-full w-full rounded-lg object-cover"
                          />
                        </span>
                        <div className="min-w-0 flex-1">
                          <h3 className="group-hover:text-primary-600 truncate text-base font-semibold text-slate-900 transition">
                            {subcat.title || subcat.name}
                          </h3>
                          <p className="mt-1 text-xs text-slate-500">
                            {formatProductCount(subcategoryCountOf(subcat))}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="card p-6 text-sm text-slate-500">
                No subcategories available for this main category.
              </div>
            )}
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 lg:grid-cols-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => selectMainCategory(cat.slug || cat.id)}
                className="card p-5 text-left"
              >
                <div className="group flex items-center gap-4 text-left">
                  <span className="group-hover:border-primary-600 block h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 border-slate-200 bg-white p-1.5 transition">
                    <img
                      src={resolveMediaUrl(cat.image) || FALLBACK_CATEGORY_IMAGE}
                      alt={getCategoryLabel(cat)}
                      loading="lazy"
                      onError={handleImageError}
                      className="h-full w-full rounded-xl object-cover transition duration-300 group-hover:scale-105"
                    />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="group-hover:text-primary-600 text-base font-semibold text-slate-900 transition">
                      {getCategoryLabel(cat)}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatProductCount(productCountOf(cat))}
                    </p>
                  </div>
                </div>

                {Array.isArray(cat.subcategories) && cat.subcategories.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {cat.subcategories.map((subcat) => (
                      <span
                        key={subcat.id}
                        className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600"
                      >
                        {subcat.title || subcat.name}
                      </span>
                    ))}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
