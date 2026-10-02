import { useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchPublicHomepage,
  selectFeaturedCollection,
  selectHeroSlides,
  selectHomePageError,
  selectHomePageLoading,
  selectHomePageSections,
  selectNewArrivalsCollection,
  selectPopularCollection,
} from "@/features/homepage";
import {
  fetchCategories,
  selectCategories,
  selectCategoriesError,
  selectCategoriesLoading,
} from "@/features/categories";
import { PUBLIC_PATHS } from "@/routes/public/public.paths";
import ErrorState from "@/components/common/ErrorState";
import LoadingSpinner from "@/components/common/LoadingSpinner";

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
  const dispatch = useDispatch();
  const sections = useSelector(selectHomePageSections);
  const slides = useSelector(selectHeroSlides);
  const featuredProducts = useSelector(selectFeaturedCollection);
  const popularProducts = useSelector(selectPopularCollection);
  const newArrivalProducts = useSelector(selectNewArrivalsCollection);
  const homepageLoading = useSelector(selectHomePageLoading);
  const homepageError = useSelector(selectHomePageError);

  const categories = useSelector(selectCategories);
  const categoriesLoading = useSelector(selectCategoriesLoading);
  const categoriesError = useSelector(selectCategoriesError);

  useEffect(() => {
    dispatch(fetchPublicHomepage());
    dispatch(fetchCategories());
  }, [dispatch]);

  const productCollections = useMemo(
    () => ({
      featured: featuredProducts.slice(0, 4),
      popular: popularProducts.slice(0, 4),
      newArrival: newArrivalProducts.slice(0, 4),
    }),
    [featuredProducts, popularProducts, newArrivalProducts],
  );

  const categoryCounts = useMemo(
    () =>
      Object.fromEntries(
        categories.map((cat) => [cat.name, cat._count?.products ?? 0]),
      ),
    [categories],
  );

  if (homepageLoading && !slides.length) {
    return <LoadingSpinner className="py-16" label="Loading homepage..." />;
  }

  if (homepageError) {
    return (
      <div className="container-app py-8">
        <ErrorState
          title="Could not load homepage"
          description={homepageError}
          onRetry={() => dispatch(fetchPublicHomepage())}
        />
      </div>
    );
  }

  return (
    <div className="w-full bg-red-50">
      <HeroSection slides={slides} />
      <PerksSection perks={sections.perks?.items || []} />

      <div className="container-app py-14">
        <div className="mx-auto max-w-7xl space-y-16">
          {sections.category?.active !== false && (
            <CategorySection
              title={sections.category?.title}
              subtitle={sections.category?.subtitle}
              categories={categories}
              categoryCounts={categoryCounts}
              loading={categoriesLoading}
              error={categoriesError}
              onRetry={() => dispatch(fetchCategories())}
            />
          )}

          {productSections
            .filter(({ key }) => sections[key]?.active !== false)
            .map(({ key, title, subtitle, to }) => (
              <ProductShowcaseSection
                key={key}
                title={sections[key]?.title || title}
                subtitle={sections[key]?.subtitle || subtitle}
                to={sections[key]?.to || to}
                products={productCollections[key]}
                loading={homepageLoading}
              />
            ))}

          {sections.promo?.active !== false && (
            <PromoSection promo={sections.promo} />
          )}
        </div>
      </div>
    </div>
  );
}
