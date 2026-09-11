import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  FunnelIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import ProductGrid from "@/components/product/ProductGrid";
import Pagination from "@/components/common/Pagination";
import Select from "@/components/common/Select";
import Button from "@/components/common/Button";
import Breadcrumb from "@/components/common/Breadcrumb";
import { selectProducts } from "@/features/products";
import { selectCategories } from "@/features/categories";
import { SORT_OPTIONS, PAGE_SIZE } from "@/constants";
import { getDiscountedPrice, classNames } from "@/utils";

export default function ProductsView() {
  const products = useSelector(selectProducts);
  const categories = useSelector(selectCategories);
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "featured");
  const [maxPrice, setMaxPrice] = useState(300);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setSearch(searchParams.get("search") || "");
    setCategory(searchParams.get("category") || "");
    setSort(searchParams.get("sort") || "featured");
    setPage(1);
  }, [searchParams]);

  const filtered = useMemo(() => {
    let list = [...products];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q),
      );
    }
    if (category) list = list.filter((p) => p.category === category);
    list = list.filter(
      (p) => getDiscountedPrice(p.price, p.discount) <= maxPrice,
    );

    switch (sort) {
      case "price-asc":
        list.sort(
          (a, b) =>
            getDiscountedPrice(a.price, a.discount) -
            getDiscountedPrice(b.price, b.discount),
        );
        break;
      case "price-desc":
        list.sort(
          (a, b) =>
            getDiscountedPrice(b.price, b.discount) -
            getDiscountedPrice(a.price, a.discount),
        );
        break;
      case "rating":
        list.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      default:
        list.sort((a, b) => Number(b.featured) - Number(a.featured));
    }
    return list;
  }, [products, search, category, sort, maxPrice]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  const clearFilters = () => {
    setMaxPrice(300);
    setSearchParams({});
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
              setPage(1);
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
            onClick={() => updateParam("category", "")}
            className={classNames(
              "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition",
              !category
                ? "bg-primary-50 text-primary-700 font-medium"
                : "text-slate-600 hover:bg-slate-50",
            )}
          >
            All Products
            <span className="text-xs text-slate-400">{products.length}</span>
          </button>
          {categories.map((cat) => {
            const count = products.filter(
              (p) => p.category === cat.name,
            ).length;
            return (
              <button
                key={cat.id}
                onClick={() => updateParam("category", cat.name)}
                className={classNames(
                  "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition",
                  category === cat.name
                    ? "bg-primary-50 text-primary-700 font-medium"
                    : "text-slate-600 hover:bg-slate-50",
                )}
              >
                {cat.name}
                <span className="text-xs text-slate-400">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-800">Max Price</h3>
        <input
          type="range"
          min="10"
          max="300"
          step="10"
          value={maxPrice}
          onChange={(e) => {
            setMaxPrice(Number(e.target.value));
            setPage(1);
          }}
          className="accent-primary-600 w-full"
        />
        <div className="mt-1 flex justify-between text-xs text-slate-500">
          <span>$10</span>
          <span className="font-semibold text-slate-700">${maxPrice}</span>
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
            {category || "All Products"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {filtered.length} product{filtered.length !== 1 && "s"} found
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
        <aside className="hidden h-fit lg:sticky lg:top-32 lg:block">
          <div className="card p-5">{FilterPanel}</div>
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
          <ProductGrid products={paged} />
          {totalPages > 1 && (
            <div className="mt-10">
              <Pagination
                page={page}
                totalPages={totalPages}
                onChange={setPage}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
