import { Link } from "react-router-dom";

import Button from "@/components/common/Button";
import { resolveMediaUrl } from "@/utils";

const fallbackPromo = {
  left: {
    eyebrow: "Limited Time",
    title: "Up to 30% off Electronics",
    description: "Upgrade your tech with our best deals of the season.",
    buttonText: "Shop Deals",
    buttonUrl: "/products?category=electronics",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80",
  },
  right: {
    eyebrow: "New Arrivals",
    title: "Fresh Fashion Drops",
    description: "Discover the newest styles added to our collection.",
    buttonText: "Explore",
    buttonUrl: "/products?category=fashion",
    image:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80",
  },
};

export default function PromoSection({ promo }) {
  const data = {
    left: { ...fallbackPromo.left, ...(promo?.left || {}) },
    right: { ...fallbackPromo.right, ...(promo?.right || {}) },
  };

  return (
    <section className="grid gap-4 sm:grid-cols-2">
      <div className="relative flex flex-col justify-center overflow-hidden rounded-2xl bg-slate-900 p-8 text-white">
        <img
          src={resolveMediaUrl(data.left.image)}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />
        <div className="relative">
          <p className="text-accent-300 text-sm font-medium">
            {data.left.eyebrow}
          </p>
          <h3 className="mt-2 text-2xl font-bold">{data.left.title}</h3>
          <p className="mt-2 max-w-xs text-sm text-slate-200">
            {data.left.description}
          </p>
          <Button
            as={Link}
            to={data.left.buttonUrl}
            variant="accent"
            className="mt-5 w-fit"
          >
            {data.left.buttonText}
          </Button>
        </div>
      </div>

      <div className="bg-accent-500 relative flex flex-col justify-center overflow-hidden rounded-2xl p-8 text-white">
        <img
          src={resolveMediaUrl(data.right.image)}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-25"
        />
        <div className="relative">
          <p className="text-sm font-medium text-white/90">
            {data.right.eyebrow}
          </p>
          <h3 className="mt-2 text-2xl font-bold">{data.right.title}</h3>
          <p className="mt-2 max-w-xs text-sm text-white/90">
            {data.right.description}
          </p>
          <Button
            as={Link}
            to={data.right.buttonUrl}
            variant="secondary"
            className="mt-5 w-fit"
          >
            {data.right.buttonText}
          </Button>
        </div>
      </div>
    </section>
  );
}
