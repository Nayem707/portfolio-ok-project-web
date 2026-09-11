import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import CategoryCard from "@/components/product/CategoryCard";
import Breadcrumb from "@/components/common/Breadcrumb";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import {
  fetchCategories,
  selectCategories,
  selectCategoriesError,
  selectCategoriesLoading,
} from "@/features/categories";

export default function CategoriesView() {
  const dispatch = useDispatch();
  const categories = useSelector(selectCategories);
  const loading = useSelector(selectCategoriesLoading);
  const error = useSelector(selectCategoriesError);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  if (loading) {
    return <LoadingSpinner className="py-16" label="Loading categories..." />;
  }

  if (error) {
    return (
      <div className="container-app py-8">
        <ErrorState
          title="Could not load categories"
          description={error}
          onRetry={() => dispatch(fetchCategories())}
        />
      </div>
    );
  }

  return (
    <div className="container-app py-8">
      <Breadcrumb items={[{ label: "Categories" }]} />
      <div className="mt-6">
        <h1 className="text-2xl font-bold text-slate-900">Browse Categories</h1>
        <p className="mt-1 text-sm text-slate-500">
          Explore our full range of product categories.
        </p>
      </div>

      {categories.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No categories available"
            description="Categories will appear here when available."
          />
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((cat) => (
            <div key={cat.id} className="space-y-3">
              <CategoryCard
                category={cat}
                productCount={cat._count?.products ?? 0}
              />
              <p className="px-1 text-sm text-slate-500">{cat.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
