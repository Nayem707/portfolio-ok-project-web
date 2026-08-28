import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import Table from "@/components/common/Table";
import Select from "@/components/common/Select";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import EmptyState from "@/components/common/EmptyState";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { selectProducts, deleteProduct } from "@/store/slices/productSlice";
import { selectCategories } from "@/store/slices/categorySlice";
import { formatCurrency, formatDate } from "@/utils";

const statusColor = { Active: "green", Draft: "yellow", Archived: "gray" };

export default function AdminProductList() {
  const products = useSelector(selectProducts);
  const categories = useSelector(selectCategories);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [toDelete, setToDelete] = useState(null);

  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) &&
          (!category || p.category === category),
      ),
    [products, search, category],
  );

  const columns = [
    {
      key: "product",
      header: "Product",
      render: (p) => (
        <div className="flex items-center gap-3">
          <img
            src={p.images?.[0]}
            alt={p.name}
            className="h-11 w-11 rounded-lg border border-slate-100 object-cover"
          />
          <div className="min-w-0">
            <p className="line-clamp-1 font-medium text-slate-800">{p.name}</p>
            <p className="text-xs text-slate-400">{p.sku}</p>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (p) => <span className="text-slate-600">{p.category}</span>,
    },
    {
      key: "price",
      header: "Price",
      render: (p) => (
        <span className="font-medium">{formatCurrency(p.price)}</span>
      ),
    },
    {
      key: "stock",
      header: "Stock",
      render: (p) => (
        <span
          className={
            p.stock === 0
              ? "text-red-500"
              : p.stock < 15
                ? "text-amber-600"
                : "text-slate-600"
          }
        >
          {p.stock}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (p) => (
        <Badge color={statusColor[p.status] || "gray"}>{p.status}</Badge>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      render: (p) => (
        <span className="text-slate-500">{formatDate(p.createdAt)}</span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (p) => (
        <div className="flex items-center gap-1">
          <Link
            to={`/admin/products/${p.id}`}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-primary-600"
            title="View"
          >
            <EyeIcon className="h-4.5 w-4.5" />
          </Link>
          <Link
            to={`/admin/products/${p.id}/edit`}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-blue-600"
            title="Edit"
          >
            <PencilSquareIcon className="h-4.5 w-4.5" />
          </Link>
          <button
            onClick={() => setToDelete(p)}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600"
            title="Delete"
          >
            <TrashIcon className="h-4.5 w-4.5" />
          </button>
        </div>
      ),
    },
  ];

  const renderCard = (p) => (
    <div className="card p-4">
      <div className="flex gap-3">
        <img
          src={p.images?.[0]}
          alt={p.name}
          className="h-16 w-16 rounded-lg border border-slate-100 object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="line-clamp-1 font-medium text-slate-800">{p.name}</p>
          <p className="text-xs text-slate-400">
            {p.category} · {p.sku}
          </p>
          <div className="mt-1 flex items-center gap-2">
            <span className="font-semibold text-slate-900">
              {formatCurrency(p.price)}
            </span>
            <Badge color={statusColor[p.status] || "gray"}>{p.status}</Badge>
          </div>
        </div>
      </div>
      <div className="mt-3 flex justify-end gap-1 border-t border-slate-100 pt-3">
        <Link
          to={`/admin/products/${p.id}`}
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
        >
          <EyeIcon className="h-4.5 w-4.5" />
        </Link>
        <Link
          to={`/admin/products/${p.id}/edit`}
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
        >
          <PencilSquareIcon className="h-4.5 w-4.5" />
        </Link>
        <button
          onClick={() => setToDelete(p)}
          className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"
        >
          <TrashIcon className="h-4.5 w-4.5" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Products"
        subtitle={`${products.length} products in your catalog`}
        actions={
          <Button
            leftIcon={PlusIcon}
            onClick={() => navigate("/admin/products/create")}
          >
            Add Product
          </Button>
        }
      />

      <div className="card p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products…"
              className="input-base pl-11"
            />
          </div>
          <div className="sm:w-52">
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.id}>{c.name}</option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      <Table
        columns={columns}
        data={filtered}
        rowKey="id"
        renderCard={renderCard}
        emptyState={
          <EmptyState
            title="No products found"
            description="Try adjusting your search or filters."
          />
        }
      />

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() => {
          dispatch(deleteProduct(toDelete.id));
          toast.success("Product deleted");
          setToDelete(null);
        }}
        title="Delete product?"
        message={`"${toDelete?.name}" will be permanently removed from your catalog.`}
        confirmText="Delete"
      />
    </div>
  );
}
