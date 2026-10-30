import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  TagIcon,
  SwatchIcon,
  ArrowsPointingOutIcon,
  ChevronRightIcon,
  ArchiveBoxIcon,
} from "@heroicons/react/24/outline";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { fetchCategories, selectCategories } from "@/features/categories";
import { fetchColors, selectColors } from "@/features/colors";
import { fetchSizes, selectSizes } from "@/features/sizes";
import { api } from "@/services/api";
import { ADMIN_PATHS } from "@/routes/admin/admin.paths";

const cards = [
  {
    key: "category",
    title: "Categories",
    description: "Manage main categories and subcategories.",
    to: `/admin/${ADMIN_PATHS.ATTRIBUTES_CATEGORIES}`,
    icon: TagIcon,
    iconBg: "bg-blue-100 text-blue-700",
  },
  {
    key: "color",
    title: "Color",
    description: "Add and maintain color swatches for products.",
    to: `/admin/${ADMIN_PATHS.ATTRIBUTES_COLORS}`,
    icon: SwatchIcon,
    iconBg: "bg-emerald-100 text-emerald-700",
  },
  {
    key: "size",
    title: "Size",
    description: "Create and order available product sizes.",
    to: `/admin/${ADMIN_PATHS.ATTRIBUTES_SIZES}`,
    icon: ArrowsPointingOutIcon,
    iconBg: "bg-amber-100 text-amber-700",
  },
  {
    key: "package",
    title: "Packages",
    description: "Create combo packages like Chador + Porda sets.",
    to: `/admin/${ADMIN_PATHS.ATTRIBUTES_PACKAGES}`,
    icon: ArchiveBoxIcon,
    iconBg: "bg-purple-100 text-purple-700",
  },
];

export default function ProductAttributesView() {
  const dispatch = useDispatch();
  const categories = useSelector(selectCategories);
  const colors = useSelector(selectColors);
  const sizes = useSelector(selectSizes);
  const [packageCount, setPackageCount] = useState(0);

  useEffect(() => {
    dispatch(fetchCategories({ all: true }));
    dispatch(fetchColors());
    dispatch(fetchSizes());
    let active = true;
    api
      .getPackages()
      .then((list) => {
        if (active) setPackageCount(Array.isArray(list) ? list.length : 0);
      })
      .catch(() => {
        if (active) setPackageCount(0);
      });
    return () => {
      active = false;
    };
  }, [dispatch]);

  const counts = {
    category: categories.length,
    color: colors.length,
    size: sizes.length,
    package: packageCount,
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Attributes"
        subtitle="Open a specific section to manage category, color, size, and package data."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.key}
            to={card.to}
            className="card group block rounded-2xl p-5 transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div
                  className={`mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl ${card.iconBg}`}
                >
                  <card.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {card.title}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {card.description}
                </p>
              </div>
              <ChevronRightIcon className="mt-1 h-5 w-5 text-slate-400 transition group-hover:text-slate-700" />
            </div>
            <div className="mt-4 border-t border-slate-100 pt-4 text-sm text-slate-600">
              {counts[card.key]} item{counts[card.key] !== 1 && "s"}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
