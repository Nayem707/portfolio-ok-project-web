import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { XMarkIcon } from "@heroicons/react/24/outline";
import Logo from "@/components/navigation/Logo";
import Button from "@/components/common/Button";
import { toggleMobileMenu } from "@/features/ui";
import { logout, selectAuth } from "@/features/auth";
import { selectCategories } from "@/features/categories";
import toast from "react-hot-toast";

export default function MobileMenu({ open }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector(selectAuth);
  const categories = useSelector(selectCategories);
  const close = () => dispatch(toggleMobileMenu(false));

  if (!open) return null;

  const go = (path) => {
    navigate(path);
    close();
  };

  return (
    <div className="lg:hidden">
      <div
        className="fixed inset-0 z-40 bg-slate-900/40"
        onClick={close}
        aria-hidden="true"
      />
      <aside className="animate-slide-in-left fixed top-0 left-0 z-50 flex h-full w-72 flex-col bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
          <Logo />
          <button
            onClick={close}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
            aria-label="Close menu"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {[
              { label: "Home", to: "/" },
              { label: "All Products", to: "/products" },
              { label: "Categories", to: "/categories" },
              { label: "Wishlist", to: "/wishlist" },
              { label: "Cart", to: "/cart" },
            ].map((link) => (
              <li key={link.to}>
                <button
                  onClick={() => go(link.to)}
                  className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>

          <p className="mt-5 px-3 text-xs font-semibold tracking-wide text-slate-400 uppercase">
            Categories
          </p>
          <ul className="mt-2 space-y-1">
            {categories.map((cat) => (
              <li key={cat.id}>
                <button
                  onClick={() =>
                    go(`/products?category=${encodeURIComponent(cat.name)}`)
                  }
                  className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-500 transition hover:bg-slate-100"
                >
                  {cat.name}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-slate-100 p-4">
          {isAuthenticated ? (
            <div className="space-y-2">
              <Button
                fullWidth
                variant="outline"
                onClick={() => go("/account")}
              >
                My Account
              </Button>
              {user.role === "ADMIN" && (
                <Button
                  fullWidth
                  variant="secondary"
                  onClick={() => go("/admin")}
                >
                  Admin Dashboard
                </Button>
              )}
              <Button
                fullWidth
                variant="ghost"
                className="text-red-600"
                onClick={() => {
                  dispatch(logout());
                  toast.success("Signed out");
                  go("/");
                }}
              >
                Sign out
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Button fullWidth onClick={() => go("/login")}>
                Sign in
              </Button>
              <Button
                fullWidth
                variant="outline"
                onClick={() => go("/register")}
              >
                Create account
              </Button>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
