import ProductGrid from "@/components/product/ProductGrid";
import SectionHeader from "@/components/common/SectionHeader";

export default function ProductShowcaseSection({
  title,
  subtitle,
  to,
  products,
  loading = false,
}) {
  return (
    <section>
      <SectionHeader title={title} subtitle={subtitle} to={to} />
      <ProductGrid products={products} loading={loading} skeletonCount={4} />
    </section>
  );
}
