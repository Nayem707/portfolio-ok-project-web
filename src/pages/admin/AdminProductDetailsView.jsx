import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { ArrowLeftIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import Rating from "@/components/common/Rating";
import Pagination from "@/components/common/Pagination";
import PriceDisplay from "@/components/common/PriceDisplay";
import EmptyState from "@/components/common/EmptyState";
import { selectProducts } from "@/features/products";
import { formatDate, formatCurrency } from "@/utils";

const statusColor = { Active: "green", Draft: "yellow", Archived: "gray" };
const colorSwatches = {
  Black: "#111827",
  White: "#f8fafc",
  Navy: "#1d4ed8",
  Sand: "#d6b38c",
  Olive: "#6b7280",
  Blue: "#3b82f6",
  Green: "#22c55e",
  Red: "#ef4444",
  Gray: "#9ca3af",
  Rose: "#f9a8d4",
  Blush: "#f5b4c5",
  Ivory: "#f5f5f4",
  Mocha: "#a16207",
  Cream: "#f5f5dc",
  Oak: "#a16207",
  Charcoal: "#374151",
  Natural: "#d6d3d1",
  Silver: "#cbd5e1",
  "Rose Gold": "#d97706",
};

export default function AdminProductDetailsView() {
  const REVIEWS_PER_PAGE = 4;
  const { id } = useParams();
  const navigate = useNavigate();
  const product = useSelector(selectProducts).find((p) => p.id === id);
  const [reviewPage, setReviewPage] = useState(1);

  const productReviews = useMemo(() => {
    if (!product) return [];

    const reviewers = [
      { name: "Alex Morgan", avatar: "https://i.pravatar.cc/80?img=12" },
      { name: "Jordan Lee", avatar: "https://i.pravatar.cc/80?img=32" },
      { name: "Casey Nguyen", avatar: "https://i.pravatar.cc/80?img=47" },
      { name: "Riley Patel", avatar: "https://i.pravatar.cc/80?img=8" },
      { name: "Taylor Brooks", avatar: "https://i.pravatar.cc/80?img=5" },
      { name: "Maya Chen", avatar: "https://i.pravatar.cc/80?img=24" },
      { name: "Noah Kim", avatar: "https://i.pravatar.cc/80?img=33" },
      { name: "Liam Scott", avatar: "https://i.pravatar.cc/80?img=41" },
    ];

    const comments = [
      `Great quality and exactly as described. Highly recommend this ${product.category.toLowerCase()} product.`,
      "Build quality feels premium and delivery was fast.",
      "Worth the price. I have been using it daily with no issues.",
      "Looks even better in person and performs well.",
      "Packaging was neat and product condition was perfect.",
      "Really happy with this purchase. Will buy again.",
      "Good value for money and reliable so far.",
      "Comfortable to use and the finish is excellent.",
    ];

    const count = Math.min(8, Math.max(6, reviewers.length));
    return reviewers.slice(0, count).map((reviewer, idx) => ({
      id: `${product.id}-review-${idx + 1}`,
      author: reviewer.name,
      avatar: reviewer.avatar,
      rating: Math.max(4, Math.min(5, Math.round(product.rating))),
      comment: comments[idx],
      date: formatDate(new Date(Date.now() - (idx + 1) * 86400000)),
    }));
  }, [product]);

  const totalReviewPages = Math.ceil(productReviews.length / REVIEWS_PER_PAGE);
  const pagedReviews = productReviews.slice(
    (reviewPage - 1) * REVIEWS_PER_PAGE,
    reviewPage * REVIEWS_PER_PAGE,
  );

  useEffect(() => {
    setReviewPage(1);
  }, [id]);

  if (!product) {
    return (
      <EmptyState
        title="Product not found"
        action={
          <Button as={Link} to="/admin/products">
            Back to products
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <button
            onClick={() => navigate("/admin/products")}
            className="mb-2 flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
          >
            <ArrowLeftIcon className="h-4 w-4" /> Back to products
          </button>
          <h1 className="text-2xl font-bold text-slate-900">{product.name}</h1>
        </div>
        <Button
          as={Link}
          to={`/admin/products/${product.id}/edit`}
          leftIcon={PencilSquareIcon}
        >
          Edit Product
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-6">
          <div className="grid grid-cols-2 gap-3">
            {product.images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt=""
                className="aspect-square w-full rounded-lg border border-slate-100 object-cover"
              />
            ))}
          </div>
        </div>

        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <Badge color={statusColor[product.status] || "gray"}>
              {product.status}
            </Badge>
            <Rating value={product.rating} reviews={product.reviews} />
          </div>
          <h2 className="mt-3 text-xl font-bold text-slate-900">
            {product.name}
          </h2>
          <div className="mt-2">
            <PriceDisplay
              price={product.price}
              discount={product.discount}
              size="lg"
            />
          </div>
          <p className="mt-4 text-sm leading-relaxed text-slate-600">
            {product.description}
          </p>

          <div className="mt-6 grid gap-4 border-t border-slate-100 pt-6 text-sm md:grid-cols-2">
            <div>
              <p className="mb-2 text-slate-400">Available colors</p>
              <div className="flex flex-wrap gap-2">
                {(product.availableColors?.length
                  ? product.availableColors
                  : ["Not specified"]
                ).map((color) =>
                  color === "Not specified" ? (
                    <span
                      key={color}
                      className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-500"
                    >
                      {color}
                    </span>
                  ) : (
                    <span
                      key={color}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2.5 py-1"
                    >
                      <span
                        className="h-3.5 w-3.5 rounded-full border border-slate-200"
                        style={{
                          backgroundColor: colorSwatches[color] || "#111827",
                        }}
                      />
                      {color}
                    </span>
                  ),
                )}
              </div>
            </div>

            <div>
              <p className="mb-2 text-slate-400">Available sizes</p>
              <div className="flex flex-wrap gap-2">
                {(product.availableSizes?.length
                  ? product.availableSizes
                  : ["Not specified"]
                ).map((size) => (
                  <span
                    key={size}
                    className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 font-medium text-slate-700"
                  >
                    {size}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-100 pt-6 text-sm sm:grid-cols-3">
            {[
              ["SKU", product.sku],
              ["Category", product.category],
              ["Stock", product.stock],
              ["Discount", `${product.discount}%`],
              ["Base price", formatCurrency(product.price)],
              ["Created", formatDate(product.createdAt)],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-slate-400">{label}</dt>
                <dd className="mt-0.5 font-medium text-slate-800">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <section className="card p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">
            Customer Reviews
          </h2>
          <p className="text-sm text-slate-500">
            Showing {(reviewPage - 1) * REVIEWS_PER_PAGE + 1}-
            {Math.min(reviewPage * REVIEWS_PER_PAGE, productReviews.length)} of{" "}
            {product.reviews}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {pagedReviews.map((review) => (
            <article
              key={review.id}
              className="rounded-xl border border-slate-200 bg-white p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={review.avatar}
                    alt={review.author}
                    className="h-9 w-9 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {review.author}
                    </p>
                    <p className="text-xs text-slate-400">{review.date}</p>
                  </div>
                </div>
                <Rating value={review.rating} showValue={false} />
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                {review.comment}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-6">
          <Pagination
            page={reviewPage}
            totalPages={totalReviewPages}
            onChange={setReviewPage}
          />
        </div>
      </section>
    </div>
  );
}
