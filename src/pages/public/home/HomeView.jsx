import { useMemo } from "react";
import { useSelector } from "react-redux";

import { selectProducts } from "@/features/products";
import { selectCategories } from "@/features/categories";
import { PUBLIC_PATHS } from "@/routes/public/public.paths";

import HeroSection from "@/pages/public/home/section/HeroSection";
import PerksSection from "@/pages/public/home/section/PerksSection";
import CategorySection from "@/pages/public/home/section/CategorySection";
import ProductShowcaseSection from "@/pages/public/home/section/ProductShowcaseSection";
import PromoSection from "@/pages/public/home/section/PromoSection";

const productSections = [
  {
    title: "Featured Products",
    subtitle: "Hand-picked favorites just for you",
    to: PUBLIC_PATHS.PRODUCTS,
    key: "featured",
  },
  {
    title: "Popular Right Now",
    subtitle: "What everyone’s buying this week",
    to: PUBLIC_PATHS.PRODUCTS,
    key: "popular",
  },
  {
    title: "New Arrivals",
    subtitle: "The latest additions to our store",
    to: `${PUBLIC_PATHS.PRODUCTS}?sort=newest`,
    key: "newArrival",
  },
];

export default function HomeView() {
  const products = useSelector(selectProducts);
  const categories = useSelector(selectCategories);

  const productCollections = useMemo(
    () => ({
      featured: products.filter((product) => product.featured).slice(0, 4),
      popular: products.filter((product) => product.popular).slice(0, 4),
      newArrival: products.filter((product) => product.newArrival).slice(0, 4),
    }),
    [products],
  );

  const categoryCounts = useMemo(
    () =>
      products.reduce((accumulator, product) => {
        accumulator[product.category] =
          (accumulator[product.category] ?? 0) + 1;
        return accumulator;
      }, {}),
    [products],
  );

  return (
    <div>
      <HeroSection />
      <PerksSection />

      <div className="container-app space-y-16 py-14">
        <CategorySection
          categories={categories}
          categoryCounts={categoryCounts}
        />

        {productSections.map(({ key, title, subtitle, to }) => (
          <ProductShowcaseSection
            key={key}
            title={title}
            subtitle={subtitle}
            to={to}
            products={productCollections[key]}
          />
        ))}

        <PromoSection />
      </div>
    </div>
  );
}
