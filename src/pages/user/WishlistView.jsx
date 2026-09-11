import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  HeartIcon,
  ShoppingBagIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import Button from "@/components/common/Button";
import EmptyState from "@/components/common/EmptyState";
import Breadcrumb from "@/components/common/Breadcrumb";
import Badge from "@/components/common/Badge";
import PriceDisplay from "@/components/common/PriceDisplay";
import {
  selectWishlistItems,
  removeFromWishlist,
  clearWishlist,
} from "@/features/wishlist";
import { addToCart } from "@/features/cart";

export default function WishlistView() {
  const dispatch = useDispatch();
  const items = useSelector(selectWishlistItems);

  if (items.length === 0) {
    return (
      <div className="container-app py-8">
        <Breadcrumb items={[{ label: "Wishlist" }]} />
        <div className="mt-8">
          <EmptyState
            icon={HeartIcon}
            title="Your wishlist is empty"
            description="Save items you love and find them all here later."
            action={
              <Button as={Link} to="/products">
                Discover products
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container-app py-8">
      <Breadcrumb items={[{ label: "Wishlist" }]} />
      <div className="mt-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">
          My Wishlist <span className="text-slate-400">({items.length})</span>
        </h1>
        <Button
          variant="ghost"
          className="text-red-500"
          onClick={() => {
            dispatch(clearWishlist());
            toast.success("Wishlist cleared");
          }}
        >
          Clear all
        </Button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const outOfStock = item.stock === 0;
          return (
            <div key={item.id} className="card flex gap-4 p-4">
              <Link to={`/products/${item.id}`} className="shrink-0">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-24 w-24 rounded-lg border border-slate-100 object-cover"
                />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <Link
                  to={`/products/${item.id}`}
                  className="hover:text-primary-700 line-clamp-2 text-sm font-semibold text-slate-800"
                >
                  {item.name}
                </Link>
                <div className="mt-1">
                  {outOfStock ? (
                    <Badge color="red">Out of stock</Badge>
                  ) : (
                    <Badge color="green">In stock</Badge>
                  )}
                </div>
                <div className="mt-2">
                  <PriceDisplay
                    price={item.price}
                    discount={item.discount}
                    size="sm"
                  />
                </div>
                <div className="mt-auto flex items-center gap-2 pt-3">
                  <Button
                    size="sm"
                    leftIcon={ShoppingBagIcon}
                    disabled={outOfStock}
                    onClick={() => {
                      dispatch(addToCart(item));
                      toast.success("Added to cart", {
                        position: "bottom-right",
                      });
                    }}
                  >
                    Add to cart
                  </Button>
                  <button
                    onClick={() => {
                      dispatch(removeFromWishlist(item.id));
                      toast.success("Removed from wishlist", {
                        position: "bottom-right",
                      });
                    }}
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                    aria-label="Remove"
                  >
                    <TrashIcon className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
