import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import ProductForm from "@/components/admin/ProductForm";
import Breadcrumb from "@/components/common/Breadcrumb";
import { addProduct } from "@/store/products";

export default function AddProduct() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = (data) => {
    dispatch(addProduct(data));
    toast.success("Product created successfully");
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
        <h1 className="text-2xl font-bold text-slate-900">Add Product</h1>
        <p className="mt-1 text-sm text-slate-500">
          Create a new product for your catalog.
        </p>
      </div>
      <ProductForm onSubmit={handleSubmit} submitLabel="Create product" />
    </div>
  );
}
