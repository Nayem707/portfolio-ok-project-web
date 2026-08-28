import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ArrowRightIcon,
  TruckIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  CreditCardIcon,
} from "@heroicons/react/24/outline";
import ProductGrid from "@/components/product/ProductGrid";
import CategoryCard from "@/components/product/CategoryCard";
import SectionHeader from "@/components/common/SectionHeader";
import Button from "@/components/common/Button";
import { selectProducts } from "@/features/products";
import { selectCategories } from "@/features/categories";

const perks = [
  { icon: TruckIcon, title: "Free Shipping", desc: "On orders over $150" },
  { icon: ArrowPathIcon, title: "Easy Returns", desc: "30-day return policy" },
  {
    icon: ShieldCheckIcon,
    title: "Secure Payments",
    desc: "Protected checkout",
  },
  { icon: CreditCardIcon, title: "Flexible Payment", desc: "Multiple methods" },
];

export default function HomeView() {
  const products = useSelector(selectProducts);
  const categories = useSelector(selectCategories);
  const featured = products.filter((p) => p.featured).slice(0, 4);
  const popular = products.filter((p) => p.popular).slice(0, 4);
  const newArrivals = products.filter((p) => p.newArrival).slice(0, 4);
  const countByCategory = (name) =>
    products.filter((p) => p.category === name).length;

  return (
    <div>
      {/* Hero */}
      <section className="from-primary-600 to-primary-800 bg-gradient-to-br">
        <div className="container-app grid items-center gap-8 py-14 lg:grid-cols-2 lg:py-20">
          <div className="text-white">
            <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
              New Season Collection 2026
            </span>
            <h1 className="mt-5 text-4xl leading-tight font-extrabold sm:text-5xl">
              Discover products you’ll love, at prices you’ll enjoy.
            </h1>
            <p className="text-primary-100 mt-4 max-w-lg">
              Shop the latest in electronics, fashion, home, and more. Quality
              products, fast delivery, and a checkout experience built for you.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                as={Link}
                to="/products"
                size="lg"
                variant="accent"
                rightIcon={ArrowRightIcon}
              >
                Shop Now
              </Button>
              <Button
                as={Link}
                to="/categories"
                size="lg"
                variant="secondary"
                className="bg-white/10 text-white hover:bg-white/20"
              >
                Browse Categories
              </Button>
            </div>
          </div>
          <div className="relative hidden lg:block">
            <img
              src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=900&q=80"
              alt="Featured products"
              className="ml-auto max-h-[420px] rounded-2xl object-cover shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* Perks */}
      <section className="border-b border-slate-200 bg-white">
        <div className="container-app grid grid-cols-2 gap-4 py-6 lg:grid-cols-4">
          {perks.map((perk) => (
            <div key={perk.title} className="flex items-center gap-3">
              <span className="bg-primary-50 text-primary-600 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg">
                <perk.icon className="h-6 w-6" />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  {perk.title}
                </p>
                <p className="text-xs text-slate-500">{perk.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="container-app space-y-16 py-14">
        {/* Categories */}
        <section>
          <SectionHeader
            title="Shop by Category"
            subtitle="Find exactly what you’re looking for"
            to="/categories"
          />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map((cat) => (
              <CategoryCard
                key={cat.id}
                category={cat}
                productCount={countByCategory(cat.name)}
              />
            ))}
          </div>
        </section>

        {/* Featured */}
        <section>
          <SectionHeader
            title="Featured Products"
            subtitle="Hand-picked favorites just for you"
            to="/products"
          />
          <ProductGrid products={featured} />
        </section>

        {/* Promo banner */}
        <section className="grid gap-4 sm:grid-cols-2">
          <div className="relative flex flex-col justify-center overflow-hidden rounded-2xl bg-slate-900 p-8 text-white">
            <img
              src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80"
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-30"
            />
            <div className="relative">
              <p className="text-accent-300 text-sm font-medium">
                Limited Time
              </p>
              <h3 className="mt-2 text-2xl font-bold">
                Up to 30% off Electronics
              </h3>
              <p className="mt-2 max-w-xs text-sm text-slate-200">
                Upgrade your tech with our best deals of the season.
              </p>
              <Button
                as={Link}
                to="/products?category=Electronics"
                variant="accent"
                className="mt-5 w-fit"
              >
                Shop Deals
              </Button>
            </div>
          </div>
          <div className="bg-accent-500 relative flex flex-col justify-center overflow-hidden rounded-2xl p-8 text-white">
            <img
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80"
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-25"
            />
            <div className="relative">
              <p className="text-sm font-medium text-white/90">New Arrivals</p>
              <h3 className="mt-2 text-2xl font-bold">Fresh Fashion Drops</h3>
              <p className="mt-2 max-w-xs text-sm text-white/90">
                Discover the newest styles added to our collection.
              </p>
              <Button
                as={Link}
                to="/products?category=Fashion"
                variant="secondary"
                className="mt-5 w-fit"
              >
                Explore
              </Button>
            </div>
          </div>
        </section>

        {/* Popular */}
        <section>
          <SectionHeader
            title="Popular Right Now"
            subtitle="What everyone’s buying this week"
            to="/products"
          />
          <ProductGrid products={popular} />
        </section>

        {/* New arrivals */}
        <section>
          <SectionHeader
            title="New Arrivals"
            subtitle="The latest additions to our store"
            to="/products?sort=newest"
          />
          <ProductGrid products={newArrivals} />
        </section>
      </div>
    </div>
  );
}
