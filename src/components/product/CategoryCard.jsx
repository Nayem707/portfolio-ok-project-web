import { Link } from "react-router-dom";

export default function CategoryCard({ category, productCount }) {
  return (
    <Link
      to={`/products?category=${encodeURIComponent(category.name)}`}
      className="group shadow-card hover:shadow-card-hover relative flex h-44 flex-col justify-end overflow-hidden rounded-xl border border-slate-200 transition"
    >
      <img
        src={category.image}
        alt={category.name}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
      <div className="relative p-4 text-white">
        <h3 className="text-base font-semibold">{category.name}</h3>
        {productCount != null && (
          <p className="mt-0.5 text-xs text-white/80">
            {productCount} products
          </p>
        )}
      </div>
    </Link>
  );
}
