import { NavLink, Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Squares2X2Icon,
  UserIcon,
  ClipboardDocumentListIcon,
  HeartIcon,
  MapPinIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import Breadcrumb from "@/components/common/Breadcrumb";
import { logout, selectCurrentUser } from "@/features/auth";
import { classNames } from "@/utils";

const navItems = [
  { to: "/account", label: "Overview", icon: Squares2X2Icon, end: true },
  { to: "/account/profile", label: "Profile", icon: UserIcon },
  { to: "/account/orders", label: "Orders", icon: ClipboardDocumentListIcon },
  { to: "/wishlist", label: "Wishlist", icon: HeartIcon },
  { to: "/account/addresses", label: "Addresses", icon: MapPinIcon },
  { to: "/account/settings", label: "Account Settings", icon: Cog6ToothIcon },
];

export default function AccountLayout() {
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return (
    <div className="container-app py-8">
      <Breadcrumb items={[{ label: "My Account" }]} />

      <div className="mt-6 grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="h-fit min-w-0 lg:sticky lg:top-24">
          <div className="card p-5">
            <div className="flex items-center gap-3">
              <img
                src={user?.avatar || "https://i.pravatar.cc/150?img=12"}
                alt={user?.name}
                className="h-12 w-12 rounded-full object-cover"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800">
                  {user?.name}
                </p>
                <p className="truncate text-xs text-slate-400">{user?.email}</p>
              </div>
            </div>
          </div>

          <nav className="card mt-4 p-2">
            <ul className="grid grid-cols-2 gap-1 sm:grid-cols-3 lg:flex lg:flex-col">
              {navItems.map((item) => (
                <li key={item.to} className="min-w-0">
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      classNames(
                        "flex items-center justify-start gap-2 rounded-lg px-2 py-2 text-xs font-medium transition sm:gap-3 sm:px-3 sm:py-2.5 sm:text-sm",
                        isActive
                          ? "bg-primary-50 text-primary-700"
                          : "text-slate-600 hover:bg-slate-50",
                      )
                    }
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </NavLink>
                </li>
              ))}
              <li className="min-w-0">
                <button
                  onClick={async () => {
                    const refreshToken = localStorage.getItem("refresh_token");

                    try {
                      if (refreshToken) {
                        await import("@/services/api").then(({ api }) =>
                          api.logout(refreshToken),
                        );
                      }
                    } catch (error) {
                      console.warn(
                        "Backend logout request failed; clearing local auth state anyway.",
                        error,
                      );
                    } finally {
                      dispatch(logout());
                      toast.success("Signed out");
                      navigate("/");
                    }
                  }}
                  className="flex w-full items-center justify-start gap-2 rounded-lg px-2 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50 sm:gap-3 sm:px-3 sm:py-2.5 sm:text-sm"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  Sign out
                </button>
              </li>
            </ul>
          </nav>
        </aside>

        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
