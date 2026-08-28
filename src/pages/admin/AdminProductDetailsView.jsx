import { useParams, Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { ArrowLeftIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import Rating from "@/components/common/Rating";
import PriceDisplay from "@/components/common/PriceDisplay";
import EmptyState from "@/components/common/EmptyState";
import { selectProducts } from "@/features/products";
import { formatDate, formatCurrency } from "@/utils";

const statusColor = { Active: "green", Draft: "yellow", Archived: "gray" };

export default function AdminProductDetailsView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = useSelector(selectProducts).find((p) => p.id === id);

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
    </div>
  );
}
