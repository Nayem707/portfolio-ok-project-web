import { useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import ProductForm from "@/components/admin/ProductForm";
import Button from "@/components/common/Button";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import {
  fetchProductByIdOrSlug,
  selectCurrentProduct,
  selectProductDetailsError,
  selectProductDetailsLoading,
  selectProducts,
  selectProductsMutationLoading,
  updateProduct,
} from "@/features/products";

export default function EditProductView() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentProduct = useSelector(selectCurrentProduct);
  const listedProduct = useSelector(selectProducts).find((p) => p.id === id);
  const product = currentProduct?.id === id ? currentProduct : listedProduct;
  const detailsLoading = useSelector(selectProductDetailsLoading);
  const detailsError = useSelector(selectProductDetailsError);
  const saving = useSelector(selectProductsMutationLoading);

  useEffect(() => {
    if (id) dispatch(fetchProductByIdOrSlug(id));
  }, [dispatch, id]);

  const handleSubmit = async (payload) => {
    try {
      await dispatch(updateProduct({ id, payload })).unwrap();
      toast.success("Product updated successfully");
      navigate("/admin/products");
    } catch (error) {
      toast.error(error || "Failed to update product");
    }
  };

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

  return (
    <div className="space-y-6">
      <div>
        <button
          onClick={() => navigate("/admin/products")}
          className="mb-2 flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
        >
          <ArrowLeftIcon className="h-4 w-4" /> Back to products
        </button>
        <h1 className="text-2xl font-bold text-slate-900">Edit Product</h1>
        <p className="mt-1 text-sm text-slate-500">
          Update details for “{product.name}”.
        </p>
      </div>
      <ProductForm
        key={product.id}
        initial={product}
        onSubmit={handleSubmit}
        submitLabel="Save changes"
        loading={saving}
      />
    </div>
  );
}
