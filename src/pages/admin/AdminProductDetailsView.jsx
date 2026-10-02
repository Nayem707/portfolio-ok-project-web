import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import Rating from "@/components/common/Rating";
import Pagination from "@/components/common/Pagination";
import PriceDisplay from "@/components/common/PriceDisplay";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import Avatar from "@/components/common/Avatar";
import RichTextContent from "@/components/common/RichTextContent";
import {
  fetchProductByIdOrSlug,
  selectCurrentProduct,
  selectProductDetailsError,
  selectProductDetailsLoading,
  selectProducts,
} from "@/features/products";
import { fetchColors, selectColors } from "@/features/colors";
import { api } from "@/services/api";
import { formatDate, formatCurrency, resolveMediaUrl } from "@/utils";
import { toProductStatusKey, toProductStatusLabel } from "@/constants";

const statusColor = { ACTIVE: "green", DRAFT: "yellow", ARCHIVED: "gray" };

export default function AdminProductDetailsView() {
  const REVIEWS_PER_PAGE = 4;
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentProduct = useSelector(selectCurrentProduct);
  const listedProduct = useSelector(selectProducts).find((p) => p.id === id);
  const product = currentProduct?.id === id ? currentProduct : listedProduct;
  const detailsLoading = useSelector(selectProductDetailsLoading);
  const detailsError = useSelector(selectProductDetailsError);
  const colors = useSelector(selectColors);
  const [reviewPage, setReviewPage] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    dispatch(fetchProductByIdOrSlug(id));
    dispatch(fetchColors());
  }, [dispatch, id]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setReviewsLoading(true);
    api
      .listProductReviews(id)
      .then((data) => {
        if (!cancelled) setReviews(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setReviews([]);
      })
      .finally(() => {
        if (!cancelled) setReviewsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const colorHex = useMemo(() => {
    const map = {};
    colors.forEach((color) => {
      if (color?.name) map[color.name] = color.hex || "#111827";
    });
    return map;
  }, [colors]);

  const productReviews = useMemo(
    () =>
      reviews.map((review) => ({
        id: review.id,
        author: review.user?.name || "Customer",
        avatarUrl: review.user?.avatarUrl || null,
        rating: review.rating,
        comment: review.comment || "No comment provided.",
        date: formatDate(review.createdAt),
      })),
    [reviews],
  );

  const totalReviewPages = Math.max(
    1,
    Math.ceil(productReviews.length / REVIEWS_PER_PAGE),
  );
  const pagedReviews = productReviews.slice(
    (reviewPage - 1) * REVIEWS_PER_PAGE,
    reviewPage * REVIEWS_PER_PAGE,
  );

  useEffect(() => {
    setReviewPage(1);
  }, [id]);

  if (detailsLoading && !product) {
    return (
      <div className="card p-10">
        <LoadingSpinner label="Loading product..." />
      </div>
    );
  }

  if (detailsError && !product) {
    return (
      <ErrorState
        title="Could not load product"
        description={detailsError}
        onRetry={() => dispatch(fetchProductByIdOrSlug(id))}
      />
    );
  }

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

  const productColors = product.colors?.length
    ? product.colors
    : product.availableColors || [];
  const productSizes = product.sizes?.length
    ? product.sizes
    : product.availableSizes || [];
  const images = product.images?.length ? product.images : [];

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
          {images.length ? (
            <div className="grid grid-cols-2 gap-3">
              {images.map((img, idx) => (
                <img
                  key={idx}
                  src={resolveMediaUrl(img)}
                  alt=""
                  className="aspect-square w-full rounded-lg border border-slate-100 object-cover"
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No images"
              description="This product has no images yet."
            />
          )}
        </div>

        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <Badge
              color={statusColor[toProductStatusKey(product.status)] || "gray"}
            >
              {toProductStatusLabel(product.status)}
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
              baseCurrency={product.baseCurrency || "BDT"}
              size="lg"
            />
          </div>
          {product.shortDescription?.length > 0 && (
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              {product.shortDescription.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                  {item}
                </li>
              ))}
            </ul>
          )}
          <RichTextContent
            value={product.description}
            className="mt-4 text-sm leading-relaxed text-slate-600"
            fallback={
              <p className="mt-4 text-sm leading-relaxed text-slate-600">
                No description provided.
              </p>
            }
          />

          <div className="mt-6 grid gap-4 border-t border-slate-100 pt-6 text-sm md:grid-cols-2">
            <div>
              <p className="mb-2 text-slate-400">Available colors</p>
              <div className="flex flex-wrap gap-2">
                {(productColors.length ? productColors : ["Not specified"]).map(
                  (color) =>
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
                            backgroundColor: colorHex[color] || "#111827",
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
                {(productSizes.length ? productSizes : ["Not specified"]).map(
                  (size) => (
                    <span
                      key={size}
                      className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 font-medium text-slate-700"
                    >
                      {size}
                    </span>
                  ),
                )}
              </div>
            </div>
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-100 pt-6 text-sm sm:grid-cols-3">
            {[
              ["SKU", product.sku],
              ["Category", product.category],
              ["Stock", product.stock],
              ["Discount", `${product.discount}%`],
              [
                "Base price",
                formatCurrency(product.price, {
                  from: product.baseCurrency || "BDT",
                  currency: product.baseCurrency || "BDT",
                  convert: false,
                }),
              ],
              [
                "Display price",
                formatCurrency(product.price, {
                  from: product.baseCurrency || "BDT",
                }),
              ],
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
            {productReviews.length
              ? `Showing ${(reviewPage - 1) * REVIEWS_PER_PAGE + 1}-${Math.min(
                  reviewPage * REVIEWS_PER_PAGE,
                  productReviews.length,
                )} of ${productReviews.length}`
              : "No reviews yet"}
          </p>
        </div>

        {reviewsLoading ? (
          <LoadingSpinner className="py-10" label="Loading reviews..." />
        ) : productReviews.length === 0 ? (
          <EmptyState
            title="No reviews"
            description="This product has not received any reviews yet."
          />
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              {pagedReviews.map((review) => (
                <article
                  key={review.id}
                  className="rounded-xl border border-slate-200 bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={resolveMediaUrl(review.avatarUrl)}
                        name={review.author}
                        size="md"
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

            {totalReviewPages > 1 && (
              <div className="mt-6">
                <Pagination
                  page={reviewPage}
                  totalPages={totalReviewPages}
                  onChange={setReviewPage}
                />
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
