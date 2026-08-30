import CategoryCard from "@/components/product/CategoryCard";
import SectionHeader from "@/components/common/SectionHeader";
import { PUBLIC_PATHS } from "@/routes/public/public.paths";

export default function CategorySection({ categories, categoryCounts }) {
  return (
    <section>
      <SectionHeader
        title="Shop by Category"
        subtitle="Find exactly what you’re looking for"
        to={PUBLIC_PATHS.CATEGORIES}
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            productCount={categoryCounts[category.name] ?? 0}
          />
        ))}
      </div>
    </section>
  );
}
