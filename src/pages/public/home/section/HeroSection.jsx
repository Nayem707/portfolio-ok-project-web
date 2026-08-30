import { Link } from "react-router-dom";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

import Button from "@/components/common/Button";
import { PUBLIC_PATHS } from "@/routes/public/public.paths";

export default function HeroSection() {
  return (
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
              to={PUBLIC_PATHS.PRODUCTS}
              size="lg"
              variant="accent"
              rightIcon={ArrowRightIcon}
            >
              Shop Now
            </Button>
            <Button
              as={Link}
              to={PUBLIC_PATHS.CATEGORIES}
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
  );
}
