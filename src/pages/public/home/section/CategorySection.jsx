import CategoryCard from "@/components/product/CategoryCard";
import SectionHeader from "@/components/common/SectionHeader";
import { PUBLIC_PATHS } from "@/routes/public/public.paths";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorState from "@/components/common/ErrorState";
import EmptyState from "@/components/common/EmptyState";

export default function CategorySection({
  categories,
  categoryCounts,
  title,
  subtitle,
  loading,
  error,
  onRetry,
}) {
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
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              productCount={
                categoryCounts[category.name] ?? category._count?.products ?? 0
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}
