import { useNavigate, useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import ProductForm from "@/components/admin/ProductForm";
import Button from "@/components/common/Button";
import EmptyState from "@/components/common/EmptyState";
import { selectProducts, updateProduct } from "@/features/products";

export default function EditProductView() {
  const { id } = useParams();
  const dispatch = useDispatch();
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

  const handleSubmit = (data) => {
    dispatch(updateProduct({ id, ...data }));
    toast.success("Product updated successfully");
    navigate("/admin/products");
  };

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
        initial={product}
        onSubmit={handleSubmit}
        submitLabel="Save changes"
      />
    </div>
  );
}
