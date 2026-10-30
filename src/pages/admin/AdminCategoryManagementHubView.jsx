import { Link } from "react-router-dom";
import {
  ChevronRightIcon,
  Squares2X2Icon,
  QueueListIcon,
} from "@heroicons/react/24/outline";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { ADMIN_PATHS } from "@/routes/admin/admin.paths";

const categoryOptions = [
  {
    key: "main",
    title: "Main Categories",
    description: "Manage top-level categories only.",
    to: `/admin/${ADMIN_PATHS.ATTRIBUTES_MAIN_CATEGORIES}`,
    icon: Squares2X2Icon,
    iconBg: "bg-blue-100 text-blue-700",
  },
  {
    key: "sub",
    title: "Subcategories",
    description: "Manage child categories and their parent mapping.",
    to: `/admin/${ADMIN_PATHS.ATTRIBUTES_SUBCATEGORIES}`,
    icon: QueueListIcon,
    iconBg: "bg-indigo-100 text-indigo-700",
  },
];

export default function AdminCategoryManagementHubView() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Category Management"
        subtitle="Choose whether to manage main categories or subcategories."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {categoryOptions.map((option) => (
          <Link
            key={option.key}
            to={option.to}
            className="card group block rounded-2xl p-5 transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div
                  className={`mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl ${option.iconBg}`}
                >
                  <option.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {option.title}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {option.description}
                </p>
              </div>
              <ChevronRightIcon className="mt-1 h-5 w-5 text-slate-400 transition group-hover:text-slate-700" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
