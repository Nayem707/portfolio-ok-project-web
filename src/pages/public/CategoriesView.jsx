import { useSelector } from "react-redux";
import CategoryCard from "@/components/product/CategoryCard";
import Breadcrumb from "@/components/common/Breadcrumb";
import { selectCategories } from "@/store/categories";
import { selectProducts } from "@/store/products";

export default function CategoriesView() {
  const categories = useSelector(selectCategories);
  const products = useSelector(selectProducts);

  const count = (name) => products.filter((p) => p.category === name).length;

  return (
    <div className="container-app py-8">
      <Breadcrumb items={[{ label: "Categories" }]} />
      <div className="mt-6">
        <h1 className="text-2xl font-bold text-slate-900">Browse Categories</h1>
        <p className="mt-1 text-sm text-slate-500">
          Explore our full range of product categories.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {categories.map((cat) => (
          <div key={cat.id} className="space-y-3">
            <CategoryCard category={cat} productCount={count(cat.name)} />
            <p className="px-1 text-sm text-slate-500">{cat.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
