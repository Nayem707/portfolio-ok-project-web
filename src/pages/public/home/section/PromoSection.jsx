import { Link } from "react-router-dom";

import Button from "@/components/common/Button";

export default function PromoSection() {
  return (
    <section className="grid gap-4 sm:grid-cols-2">
      <div className="relative flex flex-col justify-center overflow-hidden rounded-2xl bg-slate-900 p-8 text-white">
        <img
          src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />
        <div className="relative">
          <p className="text-accent-300 text-sm font-medium">Limited Time</p>
          <h3 className="mt-2 text-2xl font-bold">Up to 30% off Electronics</h3>
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
  );
}
