import { NavLink } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  Squares2X2Icon,
  CubeIcon,
  TagIcon,
  ShoppingCartIcon,
  UsersIcon,
  Cog6ToothIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Logo from "@/components/navigation/Logo";
import { toggleAdminSidebar } from "@/features/ui";
import { classNames } from "@/utils";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: Squares2X2Icon, end: true },
  { to: "/admin/orders", label: "Orders", icon: ShoppingCartIcon },
  { to: "/admin/categories", label: "Categories", icon: TagIcon },
  { to: "/admin/colors", label: "Colors", icon: TagIcon },
  { to: "/admin/sizes", label: "Sizes", icon: TagIcon },
  {
    to: "/admin/products",
    label: "Products",
    icon: CubeIcon,
  },
  { to: "/admin/users", label: "Users", icon: UsersIcon },
  {
    to: "/admin/home-page-management",
    label: "Page",
    icon: CubeIcon,
  },
  { to: "/admin/settings", label: "Settings", icon: Cog6ToothIcon },
];

export default function AdminSidebar({ open }) {
  const dispatch = useDispatch();
  const close = () => dispatch(toggleAdminSidebar(false));

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}
      <aside
        className={classNames(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-800 bg-slate-900 transition-transform duration-200 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-800 px-5">
          <Logo textClassName="text-white" />
          <button
            onClick={close}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 lg:hidden"
            aria-label="Close sidebar"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={close}
              className={({ isActive }) =>
                classNames(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                  isActive
                    ? "bg-primary-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white",
                )
              }
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-800 p-3">
          <NavLink
            to="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
          >
            <Squares2X2Icon className="h-5 w-5" />
            Back to Store
          </NavLink>
        </div>
      </aside>
    </>
  );
}
