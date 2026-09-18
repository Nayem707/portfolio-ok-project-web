import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
  CubeIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  ArchiveBoxIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import StatCard from "@/components/common/StatCard";
import Table from "@/components/common/Table";
import Pagination from "@/components/common/Pagination";
import Select from "@/components/common/Select";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import {
  deleteProduct,
  fetchProducts,
  selectProducts,
  selectProductsError,
  selectProductsLoading,
  selectProductsMutationLoading,
} from "@/features/products";
import { fetchCategories, selectCategories } from "@/features/categories";
import { formatCurrency, formatDate, getProductImage } from "@/utils";
import {
  PRODUCT_STATUS,
  toProductStatusKey,
  toProductStatusLabel,
} from "@/constants";

const statusColor = { ACTIVE: "green", DRAFT: "yellow", ARCHIVED: "gray" };
const PAGE_SIZE_OPTIONS = [10, 20, 30, 50];
const ADMIN_PRODUCT_LIMIT = 100;

export default function AdminProductListView() {
  const products = useSelector(selectProducts);
  const productsLoading = useSelector(selectProductsLoading);
  const productsError = useSelector(selectProductsError);
  const mutationLoading = useSelector(selectProductsMutationLoading);
  const categories = useSelector(selectCategories);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState(null);

  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) &&
          (!category || p.category === category || p.categoryId === category) &&
          (!status || toProductStatusKey(p.status) === toProductStatusKey(status)),
      ),
    [products, search, category, status],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pagedProducts = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize],
  );

  const overview = useMemo(() => {
    const active = products.filter(
      (p) => toProductStatusKey(p.status) === "ACTIVE",
    ).length;
    const draft = products.filter(
      (p) => toProductStatusKey(p.status) === "DRAFT",
    ).length;
    const archived = products.filter(
      (p) => toProductStatusKey(p.status) === "ARCHIVED",
    ).length;
    const outOfStock = products.filter((p) => p.stock === 0).length;

    return {
      total: products.length,
      active,
      draft,
      archived,
      outOfStock,
    };
  }, [products]);

  useEffect(() => {
    dispatch(fetchProducts({ limit: ADMIN_PRODUCT_LIMIT }));
    dispatch(fetchCategories({ all: true }));
  }, [dispatch]);

  useEffect(() => {
    setPage(1);
  }, [search, category, status, pageSize]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const columns = [
    {
      key: "product",
      header: "Product",
      render: (p) => (
        <div className="flex items-center gap-3">
          <img
            src={getProductImage(p)}
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
          {p.stock === 0 ? "Out of stock" : p.stock}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (p) => (
        <Badge color={statusColor[toProductStatusKey(p.status)] || "gray"}>
          {toProductStatusLabel(p.status)}
        </Badge>
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
            className="hover:text-primary-600 rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
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
          src={getProductImage(p)}
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
            <Badge color={statusColor[toProductStatusKey(p.status)] || "gray"}>
              {toProductStatusLabel(p.status)}
            </Badge>
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

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard
          label="Total Products"
          value={overview.total}
          icon={CubeIcon}
          tone="blue"
        />
        <StatCard
          label="Active"
          value={overview.active}
          icon={CheckCircleIcon}
          tone="green"
        />
        <StatCard
          label="Draft"
          value={overview.draft}
          icon={DocumentTextIcon}
          tone="yellow"
        />
        <StatCard
          label="Archived"
          value={overview.archived}
          icon={ArchiveBoxIcon}
          tone="purple"
        />
        <StatCard
          label="Out of Stock"
          value={overview.outOfStock}
          icon={ExclamationTriangleIcon}
          tone="orange"
        />
      </div>

      <div className="card p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-3.5 h-5 w-5 -translate-y-1/2 text-slate-400" />
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
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="sm:w-44">
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All status</option>
              {Object.entries(PRODUCT_STATUS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
          <div className="sm:w-36">
            <Select
              value={String(pageSize)}
              onChange={(e) => setPageSize(Number(e.target.value))}
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  Show {size}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      {productsError ? (
        <ErrorState
          title="Could not load products"
          description={productsError}
          onRetry={() =>
            dispatch(fetchProducts({ limit: ADMIN_PRODUCT_LIMIT }))
          }
        />
      ) : productsLoading && !products.length ? (
        <div className="card p-10">
          <LoadingSpinner label="Loading products..." />
        </div>
      ) : (
        <>
          <Table
            columns={columns}
            data={pagedProducts}
            rowKey="id"
            renderCard={renderCard}
            emptyState={
              <EmptyState
                title="No products found"
                description="Try adjusting your search or filters."
              />
            }
          />

          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => !mutationLoading && setToDelete(null)}
        onConfirm={async () => {
          if (!toDelete) return;
          try {
            await dispatch(deleteProduct(toDelete.id)).unwrap();
            toast.success("Product deleted");
            setToDelete(null);
          } catch (error) {
            toast.error(error || "Failed to delete product");
          }
        }}
        title="Delete product?"
        message={`"${toDelete?.name}" will be permanently removed from your catalog.`}
        confirmText="Delete"
        loading={mutationLoading}
      />
    </div>
  );
}
