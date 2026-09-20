import { Link } from "react-router-dom";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";
import CategoryCard from "@/components/product/CategoryCard";
import SectionHeader from "@/components/common/SectionHeader";
import { PUBLIC_PATHS } from "@/routes/public/public.paths";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorState from "@/components/common/ErrorState";
import EmptyState from "@/components/common/EmptyState";

const VISIBLE_COUNT = 4;

export default function CategorySection({
  categories,
  categoryCounts,
  title,
  subtitle,
  loading,
  error,
  onRetry,
}) {
  const visible = categories.slice(0, VISIBLE_COUNT);
  const hasMore = categories.length > VISIBLE_COUNT;

  return (
    <section>
      <SectionHeader
        title={title || "Shop by Category"}
        subtitle={subtitle || "Find exactly what you’re looking for"}
        to={PUBLIC_PATHS.CATEGORIES}
      />

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
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {visible.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              productCount={
                categoryCounts[category.name] ?? category._count?.products ?? 0
              }
            />
          ))}
          {hasMore && (
            <Link
              to={PUBLIC_PATHS.CATEGORIES}
              className="group shadow-card hover:shadow-card-hover relative flex h-44 flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50 transition hover:border-primary-400 hover:bg-primary-50/40"
            >
              <span className="bg-primary-100 text-primary-700 flex h-11 w-11 items-center justify-center rounded-full transition group-hover:scale-105">
                <EllipsisHorizontalIcon className="h-6 w-6" />
              </span>
              <span className="text-sm font-semibold text-slate-800">
                Show more
              </span>
              <span className="text-xs text-slate-500">
                +{categories.length - VISIBLE_COUNT} categories
              </span>
            </Link>
          )}
        </div>
      )}
    </section>
  );
}
