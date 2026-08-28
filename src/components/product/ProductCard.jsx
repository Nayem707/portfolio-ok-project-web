import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { HeartIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import Rating from "@/components/common/Rating";
import PriceDisplay from "@/components/common/PriceDisplay";
import Badge from "@/components/common/Badge";
import { addToCart } from "@/store/slices/cartSlice";
import {
  toggleWishlist,
  selectWishlistItems,
} from "@/store/slices/wishlistSlice";
import { classNames } from "@/utils";

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const wishlist = useSelector(selectWishlistItems);
  const isWishlisted = wishlist.some((i) => i.id === product.id);
  const outOfStock = product.stock === 0;

  const handleAddToCart = () => {
    if (outOfStock) return;
    dispatch(addToCart(product));
    toast.success(`${product.name} added to cart`);
  };

  const handleWishlist = () => {
    dispatch(toggleWishlist(product));
    toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist");
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card transition duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
      <div className="relative aspect-square overflow-hidden bg-slate-100">
        <Link to={`/products/${product.id}`}>
          <img
            src={product.images?.[0] || product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        </Link>

        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.discount > 0 && (
            <Badge color="red">-{Math.round(product.discount)}%</Badge>
          )}
          {product.newArrival && <Badge color="green">New</Badge>}
        </div>

        <button
          onClick={handleWishlist}
          className={classNames(
            "absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition hover:scale-105",
            isWishlisted ? "text-red-500" : "text-slate-500",
          )}
          aria-label="Toggle wishlist"
        >
          {isWishlisted ? (
            <HeartSolid className="h-5 w-5" />
          ) : (
            <HeartIcon className="h-5 w-5" />
          )}
        </button>

        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60">
            <span className="rounded-full bg-slate-900/80 px-3 py-1 text-xs font-semibold text-white">
              Out of stock
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <span className="text-xs font-medium text-primary-600">
          {product.category}
        </span>
        <Link to={`/products/${product.id}`} className="mt-1">
          <h3 className="line-clamp-2 text-sm font-semibold text-slate-800 transition hover:text-primary-700">
            {product.name}
          </h3>
        </Link>
        <div className="mt-2">
          <Rating value={product.rating} reviews={product.reviews} />
        </div>
        <div className="mt-3 flex items-end justify-between gap-2">
          <PriceDisplay price={product.price} discount={product.discount} />
          <button
            onClick={handleAddToCart}
            disabled={outOfStock}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-600 text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Add to cart"
          >
            <ShoppingBagIcon className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
