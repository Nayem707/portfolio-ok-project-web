import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  HeartIcon,
  ShoppingBagIcon,
  BoltIcon,
  TruckIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import Breadcrumb from "@/components/common/Breadcrumb";
import Rating from "@/components/common/Rating";
import PriceDisplay from "@/components/common/PriceDisplay";
import Badge from "@/components/common/Badge";
import Button from "@/components/common/Button";
import QuantitySelector from "@/components/common/QuantitySelector";
import SectionHeader from "@/components/common/SectionHeader";
import ProductGrid from "@/components/product/ProductGrid";
import EmptyState from "@/components/common/EmptyState";
import { selectProducts } from "@/features/products";
import { addToCart } from "@/features/cart";
import { toggleWishlist, selectWishlistItems } from "@/features/wishlist";
import { classNames } from "@/utils";

export default function ProductDetailsView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const products = useSelector(selectProducts);
  const wishlist = useSelector(selectWishlistItems);

  const product = products.find((p) => p.id === id);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <div className="container-app py-16">
        <EmptyState
          title="Product not found"
          description="The product you’re looking for doesn’t exist or has been removed."
          action={
            <Button as={Link} to="/products">
              Back to products
            </Button>
          }
        />
      </div>
    );
  }

  const isWishlisted = wishlist.some((i) => i.id === product.id);
  const outOfStock = product.stock === 0;
  const related = products
    .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
    .slice(0, 4);

  const handleAddToCart = () => {
    dispatch(addToCart({ ...product, quantity }));
    toast.success(`${product.name} added to cart`);
  };

  const handleBuyNow = () => {
    dispatch(addToCart({ ...product, quantity }));
    navigate("/checkout");
  };

  return (
    <div className="container-app py-8">
      <Breadcrumb
        items={[
          { label: "Products", to: "/products" },
          {
            label: product.category,
            to: `/products?category=${product.category}`,
          },
          { label: product.name },
        ]}
      />

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <div>
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <img
              src={product.images[activeImage]}
              alt={product.name}
              className="aspect-square w-full object-cover"
            />
            {product.discount > 0 && (
              <Badge color="red" className="absolute top-4 left-4">
                -{Math.round(product.discount)}% OFF
              </Badge>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="mt-4 flex gap-3">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={classNames(
                    "h-20 w-20 overflow-hidden rounded-lg border-2 transition",
                    activeImage === idx
                      ? "border-primary-600"
                      : "border-slate-200",
                  )}
                >
                  <img
                    src={img}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <span className="text-primary-600 text-sm font-medium">
            {product.category}
          </span>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            {product.name}
          </h1>
          <div className="mt-3 flex items-center gap-4">
            <Rating
              value={product.rating}
              reviews={product.reviews}
              size="md"
            />
            <span className="text-sm text-slate-400">SKU: {product.sku}</span>
          </div>

          <div className="mt-5">
            <PriceDisplay
              price={product.price}
              discount={product.discount}
              size="xl"
            />
          </div>

          <p className="mt-5 leading-relaxed text-slate-600">
            {product.description}
          </p>

          <div className="mt-5 flex items-center gap-2">
            {outOfStock ? (
              <Badge color="red" dot>
                Out of stock
              </Badge>
            ) : product.stock < 15 ? (
              <Badge color="yellow" dot>
                Only {product.stock} left in stock
              </Badge>
            ) : (
              <Badge color="green" dot>
                In stock
              </Badge>
            )}
          </div>

          {!outOfStock && (
            <div className="mt-6 flex items-center gap-4">
              <span className="text-sm font-medium text-slate-700">
                Quantity
              </span>
              <QuantitySelector
                value={quantity}
                onChange={setQuantity}
                max={product.stock}
              />
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              size="lg"
              leftIcon={ShoppingBagIcon}
              onClick={handleAddToCart}
              disabled={outOfStock}
              className="flex-1"
            >
              Add to Cart
            </Button>
            <Button
              size="lg"
              variant="accent"
              leftIcon={BoltIcon}
              onClick={handleBuyNow}
              disabled={outOfStock}
              className="flex-1"
            >
              Buy Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                dispatch(toggleWishlist(product));
                toast.success(
                  isWishlisted ? "Removed from wishlist" : "Added to wishlist",
                );
              }}
              className={classNames(
                isWishlisted && "border-red-200 text-red-500",
              )}
            >
              {isWishlisted ? (
                <HeartSolid className="h-5 w-5" />
              ) : (
                <HeartIcon className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Perks */}
          <div className="mt-8 grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-3">
            {[
              { icon: TruckIcon, label: "Free shipping over $150" },
              { icon: ArrowPathIcon, label: "30-day easy returns" },
              { icon: ShieldCheckIcon, label: "Secure checkout" },
            ].map((perk) => (
              <div
                key={perk.label}
                className="flex items-center gap-2 text-sm text-slate-600"
              >
                <perk.icon className="text-primary-600 h-5 w-5" />
                {perk.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Product information */}
      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-slate-900">
            Product Information
          </h3>
          <dl className="mt-4 divide-y divide-slate-100 text-sm">
            {[
              ["Category", product.category],
              ["SKU", product.sku],
              [
                "Availability",
                outOfStock ? "Out of stock" : `${product.stock} in stock`,
              ],
              ["Rating", `${product.rating} / 5`],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between py-2.5">
                <dt className="text-slate-500">{label}</dt>
                <dd className="font-medium text-slate-800">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-slate-900">Highlights</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
            {[
              "Premium quality materials and craftsmanship",
              "Backed by our satisfaction guarantee",
              "Ships within 1–2 business days",
              "Trusted by thousands of happy customers",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <section className="mt-14">
          <SectionHeader title="Related Products" />
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}
