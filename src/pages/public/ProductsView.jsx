import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  FunnelIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  Squares2X2Icon,
  TagIcon,
} from "@heroicons/react/24/outline";
import ProductGrid from "@/components/product/ProductGrid";
import Pagination from "@/components/common/Pagination";
import Select from "@/components/common/Select";
import Button from "@/components/common/Button";
import Breadcrumb from "@/components/common/Breadcrumb";
import ErrorState from "@/components/common/ErrorState";
import EmptyState from "@/components/common/EmptyState";
import {
  fetchProducts,
  selectProductListMeta,
  selectProducts,
  selectProductsError,
  selectProductsLoading,
} from "@/features/products";
import {
  fetchCategories,
  selectCategories,
  selectCategoriesLoading,
} from "@/features/categories";
import { fetchColors, selectColors } from "@/features/colors";
import { fetchSizes, selectSizes } from "@/features/sizes";
import { SORT_OPTIONS, PAGE_SIZE } from "@/constants";
import {
  classNames,
  formatCurrency,
  getCategoryLabel,
  resolveMediaUrl,
} from "@/utils";
import { api } from "@/services/api";
import useDebounce from "@/hooks/useDebounce";

const parseMultiParam = (value) =>
  (value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const parsePriceParam = (value) => {
  const price = Number(value);
  return Number.isFinite(price) && price > 0 ? price : null;
};

const toPriceCeiling = (price) =>
  Math.max(100, Math.ceil((Number(price) || 0) / 100) * 100);

export default function ProductsView() {
  const dispatch = useDispatch();
  const products = useSelector(selectProducts);
  const productsLoading = useSelector(selectProductsLoading);
  const productsError = useSelector(selectProductsError);
  const productsMeta = useSelector(selectProductListMeta);
  const categories = useSelector(selectCategories);
  const categoriesLoading = useSelector(selectCategoriesLoading);
  const colors = useSelector(selectColors);
  const sizes = useSelector(selectSizes);
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [subcategory, setSubcategory] = useState(
    searchParams.get("subcategory") || "",
  );
  const [sort, setSort] = useState(searchParams.get("sort") || "featured");
  const [maxPrice, setMaxPrice] = useState(
    parsePriceParam(searchParams.get("maxPrice")),
  );
  const [catalogStats, setCatalogStats] = useState({
    total: null,
    priceCeiling: null,
  });
  const [selectedColors, setSelectedColors] = useState(
    parseMultiParam(searchParams.get("color")),
  );
  const [selectedSizes, setSelectedSizes] = useState(
    parseMultiParam(searchParams.get("size")),
  );
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [showFilters, setShowFilters] = useState(false);
  const debouncedSearch = useDebounce(search, 350);

  useEffect(() => {
    setSearch(searchParams.get("search") || "");
    setCategory(searchParams.get("category") || "");
    setSubcategory(searchParams.get("subcategory") || "");
    setSort(searchParams.get("sort") || "featured");
    setMaxPrice(parsePriceParam(searchParams.get("maxPrice")));
    setSelectedColors(parseMultiParam(searchParams.get("color")));
    setSelectedSizes(parseMultiParam(searchParams.get("size")));
    setPage(Number(searchParams.get("page")) || 1);
  }, [searchParams]);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchColors());
    dispatch(fetchSizes());
  }, [dispatch]);

  useEffect(() => {
    let active = true;
    api
      .getProducts({ page: 1, limit: 1 })
      .then((response) => {
        if (active)
          setCatalogStats((prev) => ({
            ...prev,
            total: response?.meta?.total ?? null,
          }));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    api
      .getProducts({
        page: 1,
        limit: 1,
        sort: "price-desc",
        category: category || undefined,
      })
      .then((response) => {
        if (active)
          setCatalogStats((prev) => ({
            ...prev,
            priceCeiling: toPriceCeiling(response?.data?.[0]?.price),
          }));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [category]);

  const colorParam = selectedColors.join(",");
  const sizeParam = selectedSizes.join(",");
  const listParams = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      search: debouncedSearch || undefined,
      category: category || undefined,
      subcategory: subcategory || undefined,
      maxPrice: maxPrice ?? undefined,
      color: colorParam || undefined,
      size: sizeParam || undefined,
      sort: sort || undefined,
    }),
    [page, debouncedSearch, category, subcategory, maxPrice, colorParam, sizeParam, sort],
  );

  useEffect(() => {
    dispatch(fetchProducts(listParams));
  }, [dispatch, listParams]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);

    if (key !== "page") {
      next.set("page", "1");
    }

    setSearchParams(next);
  };

  const selectCategory = (nextCategory) => {
    const next = new URLSearchParams(searchParams);
    if (nextCategory) {
      next.set("category", nextCategory);
      next.delete("subcategory");
    } else {
      next.delete("category");
      next.delete("subcategory");
    }
    next.set("page", "1");
    setSearchParams(next);
  };

  const updateMultiParam = (key, values) => {
    const next = new URLSearchParams(searchParams);
    if (values.length) next.set(key, values.join(","));
    else next.delete(key);
    next.set("page", "1");
    setSearchParams(next);
  };

  const toggleColor = (value) => {
    const nextValues = selectedColors.includes(value)
      ? selectedColors.filter((item) => item !== value)
      : [...selectedColors, value];
    updateMultiParam("color", nextValues);
  };

  const toggleSize = (value) => {
    const nextValues = selectedSizes.includes(value)
      ? selectedSizes.filter((item) => item !== value)
      : [...selectedSizes, value];
    updateMultiParam("size", nextValues);
  };

  const clearFilters = () => {
    setMaxPrice(null);
    setSearch("");
    setSelectedColors([]);
    setSelectedSizes([]);
    setSearchParams({ page: "1", sort: "featured" });
  };

  const selectedCategoryName = useMemo(() => {
    if (!category) return "All Products";
    const match = categories.find(
      (cat) => cat.slug === category || cat.id === category,
    );
    const base = getCategoryLabel(match) || "Products";
    if (!subcategory) return base;
    const subMatch = match?.subcategories?.find(
      (sub) => sub.slug === subcategory || sub.id === subcategory,
    );
    return subMatch ? `${base} / ${subMatch.title || subMatch.name}` : base;
  }, [category, subcategory, categories]);
  const selectedCategoryObj = useMemo(
    () =>
      categories.find((cat) => cat.slug === category || cat.id === category) ||
      null,
    [categories, category],
  );

  const selectedCategorySubcategories = Array.isArray(
    selectedCategoryObj?.subcategories,
  )
    ? selectedCategoryObj.subcategories
    : [];

  useEffect(() => {
    if (!subcategory || !selectedCategoryObj) return;
    const exists = selectedCategorySubcategories.some(
      (sub) => sub.id === subcategory || sub.slug === subcategory,
    );
    if (!exists) updateParam("subcategory", "");
  }, [subcategory, selectedCategoryObj, selectedCategorySubcategories]);

  const hasActiveFilters = Boolean(
    debouncedSearch ||
    category ||
    subcategory ||
    maxPrice ||
    selectedColors.length ||
    selectedSizes.length,
  );

  const totalItems = productsMeta?.total ?? products.length;
  const totalPages = productsMeta?.totalPages ?? 1;
  const allProductsCount = catalogStats.total ?? totalItems;
  const priceCeiling = Math.max(
    catalogStats.priceCeiling ?? 0,
    toPriceCeiling(maxPrice),
  );
  const priceStep = priceCeiling > 1000 ? 50 : 10;
  const priceValue = maxPrice ?? priceCeiling;

  const retryProducts = () => {
    dispatch(fetchProducts(listParams));
  };

  const FilterPanel = (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-800">Search</h3>
        <div className="relative">
          <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-3 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              updateParam("search", e.target.value.trim());
            }}
            placeholder="Search products…"
            className="input-base pl-9"
          />
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-800">
          Categories
        </h3>
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => selectCategory("")}
            className={classNames(
              "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition",
              !category
                ? "bg-primary-50 text-primary-700 font-medium"
                : "text-slate-600 hover:bg-slate-50",
            )}
          >
            <span
              className={classNames(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
                !category
                  ? "bg-primary-100 text-primary-700"
                  : "bg-slate-100 text-slate-500",
              )}
            >
              <Squares2X2Icon className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1 truncate text-left">
              All Products
            </span>
            <span className="shrink-0 text-xs text-slate-400">
              {allProductsCount}
            </span>
          </button>
          <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
            {categories.map((cat) => {
              const count = cat._count?.products ?? 0;
              const catKey = cat.slug || cat.id;
              const isActive = category === catKey;
              const imageUrl = resolveMediaUrl(cat.image);
              return (
                <div key={cat.id} className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => selectCategory(catKey)}
                    className={classNames(
                      "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition",
                      isActive
                        ? "bg-primary-50 text-primary-700 font-medium"
                        : "text-slate-600 hover:bg-slate-50",
                    )}
                  >
                    <span
                      className={classNames(
                        "flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-md",
                        isActive
                          ? "bg-primary-100 text-primary-700"
                          : "bg-slate-100 text-slate-500",
                      )}
                    >
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <TagIcon className="h-4 w-4" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-left">
                      {getCategoryLabel(cat)}
                    </span>
                    <span className="shrink-0 text-xs text-slate-400">
                      {count}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-800">
          Subcategories
        </h3>
        {!selectedCategoryObj ? (
          <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
            Select a main category to view subcategories.
          </p>
        ) : selectedCategorySubcategories.length === 0 ? (
          <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
            No subcategories available for this main category.
          </p>
        ) : (
          <div className="space-y-1 rounded-lg border border-slate-200 bg-slate-50 p-2">
            <button
              type="button"
              onClick={() => updateParam("subcategory", "")}
              className={classNames(
                "block w-full rounded-md px-2 py-1.5 text-left text-xs transition",
                !subcategory
                  ? "bg-primary-100 text-primary-700 font-medium"
                  : "text-slate-600 hover:bg-slate-100",
              )}
            >
              All subcategories
            </button>
            {selectedCategorySubcategories.map((subcat) => {
              const subKey = subcat.slug || subcat.id;
              const activeSub = subcategory === subKey;
              return (
                <button
                  key={subcat.id}
                  type="button"
                  onClick={() => updateParam("subcategory", subKey)}
                  className={classNames(
                    "block w-full rounded-md px-2 py-1.5 text-left text-xs transition",
                    activeSub
                      ? "bg-primary-100 text-primary-700 font-medium"
                      : "text-slate-600 hover:bg-slate-100",
                  )}
                >
                  {subcat.title || subcat.name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-800">Colors</h3>
        <div className="space-y-2">
          {colors.map((color) => {
            const optionKey = color.id || color.name;
            const optionValue = color.id || color.name;
            return (
              <label
                key={optionKey}
                className="flex cursor-pointer items-center gap-2 text-sm text-slate-700"
              >
                <input
                  type="checkbox"
                  checked={selectedColors.includes(optionValue)}
                  onChange={() => toggleColor(optionValue)}
                  className="accent-primary-600 h-4 w-4 rounded border-slate-300"
                />
                <span>{color.name}</span>
              </label>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-800">Sizes</h3>
        <div className="space-y-2">
          {sizes.map((size) => {
            const optionKey = size.id || size.name;
            const optionValue = size.id || size.name;
            return (
              <label
                key={optionKey}
                className="flex cursor-pointer items-center gap-2 text-sm text-slate-700"
              >
                <input
                  type="checkbox"
                  checked={selectedSizes.includes(optionValue)}
                  onChange={() => toggleSize(optionValue)}
                  className="accent-primary-600 h-4 w-4 rounded border-slate-300"
                />
                <span>{size.name}</span>
              </label>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-800">Max Price</h3>
        <input
          type="range"
          min={priceStep}
          max={priceCeiling}
          step={priceStep}
          value={priceValue}
          onChange={(e) => {
            const value = Number(e.target.value);
            const next = value >= priceCeiling ? null : value;
            setMaxPrice(next);
            updateParam("maxPrice", next ? String(next) : "");
          }}
          className="accent-primary-600 w-full"
        />
        <div className="mt-1 flex justify-between text-xs text-slate-500">
          <span>{formatCurrency(priceStep)}</span>
          <span className="font-semibold text-slate-700">
            {formatCurrency(priceValue)}
          </span>
        </div>
      </div>

      <Button variant="outline" fullWidth onClick={clearFilters}>
        Clear Filters
      </Button>
    </div>
  );

  return (
    <div className="container-app py-8">
      <Breadcrumb items={[{ label: "Products" }]} />

      <div className="mt-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {selectedCategoryName}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {totalItems} product{totalItems !== 1 && "s"} found
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            leftIcon={FunnelIcon}
            onClick={() => setShowFilters(true)}
            className="lg:hidden"
          >
            Filters
          </Button>
          <div className="w-48">
            <Select
              value={sort}
              onChange={(e) => updateParam("sort", e.target.value)}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[260px_1fr]">
        {/* Desktop filters */}
        <aside className="hidden lg:block">
          <div className="card min-h-112 p-5">{FilterPanel}</div>
        </aside>

        {/* Mobile filter drawer */}
        {showFilters && (
          <div className="lg:hidden">
            <div
              className="fixed inset-0 z-40 bg-slate-900/40"
              onClick={() => setShowFilters(false)}
            />
            <div className="animate-slide-in-left fixed top-0 left-0 z-50 h-full w-80 max-w-[85%] overflow-y-auto bg-white p-5 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Filters</h2>
                <button
                  type="button"
                  onClick={() => setShowFilters(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              {FilterPanel}
            </div>
          </div>
        )}

        <div className="min-w-0">
          {productsError ? (
            <ErrorState
              title="Could not load products"
              description={productsError}
              onRetry={retryProducts}
            />
          ) : !productsLoading && !products.length && hasActiveFilters ? (
            <EmptyState
              title="No products match your filters"
              description={
                maxPrice
                  ? `Nothing ${category ? `in ${selectedCategoryName} ` : ""}costs ${formatCurrency(maxPrice)} or less. Try a higher max price.`
                  : "Try removing a filter to see more products."
              }
              action={
                <div className="flex flex-wrap justify-center gap-2">
                  {maxPrice && (
                    <Button
                      onClick={() => {
                        setMaxPrice(null);
                        updateParam("maxPrice", "");
                      }}
                    >
                      Remove price limit
                    </Button>
                  )}
                  <Button variant="outline" onClick={clearFilters}>
                    Clear all filters
                  </Button>
                </div>
              }
            />
          ) : (
            <ProductGrid
              products={products}
              loading={productsLoading}
              lockWhenInCart
            />
          )}
          {totalPages > 1 && (
            <div className="mt-10">
              <Pagination
                page={page}
                totalPages={totalPages}
                onChange={(nextPage) => {
                  setPage(nextPage);
                  updateParam("page", String(nextPage));
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
