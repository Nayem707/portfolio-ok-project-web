import ProductGrid from "@/components/product/ProductGrid";
import SectionHeader from "@/components/common/SectionHeader";

export default function ProductShowcaseSection({
  title,
  subtitle,
  to,
  products,
}) {
  return (
    <section>
      <SectionHeader title={title} subtitle={subtitle} to={to} />
      <ProductGrid products={products} />
    </section>
  );
}
