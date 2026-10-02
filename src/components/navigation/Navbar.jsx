import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  MagnifyingGlassIcon,
  HeartIcon,
  ShoppingBagIcon,
  UserCircleIcon,
  Bars3Icon,
  Squares2X2Icon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  TruckIcon,
  HomeIcon,
  BuildingStorefrontIcon,
} from "@heroicons/react/24/outline";
import Logo from "@/components/navigation/Logo";
import NoticeMarquee from "@/components/navigation/NoticeMarquee";
import SearchBar from "@/components/common/SearchBar";
import Dropdown, { DropdownItem } from "@/components/common/Dropdown";
import Avatar from "@/components/common/Avatar";
import GoogleVerifiedBadge from "@/components/common/GoogleVerifiedBadge";
import { selectCartCount } from "@/features/cart";
import { selectWishlistCount } from "@/features/wishlist";
import { toggleMiniCart, toggleMobileMenu } from "@/features/ui";
import { logout, selectAuth } from "@/features/auth";
import { resetCartState } from "@/features/cart";
import { resetWishlistState } from "@/features/wishlist";
import { clearMyOrderState } from "@/features/orders";
import { fetchCategories, selectCategories } from "@/features/categories";
import { defaultSections, mapHomepageSectionData } from "@/features/homepage";
import { api } from "@/services/api";
import { classNames } from "@/utils";
import toast from "react-hot-toast";

const navLinkClass = ({ isActive }) =>
  classNames(
    "text-sm font-medium transition",
    isActive ? "text-primary-700" : "text-slate-600 hover:text-primary-600",
  );

const MAIN_LINKS = [
  { label: "Home", to: "/", end: true, icon: HomeIcon },
  { label: "All Products", to: "/products", icon: BuildingStorefrontIcon },
  { label: "Categories", to: "/categories", icon: Squares2X2Icon },
  { label: "Track Order", to: "/track-order", icon: TruckIcon },
];

function TopNotice() {
  const [marquee, setMarquee] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api
      .getHomepageSections()
      .then((sections) => {
        if (!cancelled)
          setMarquee(
            mapHomepageSectionData(defaultSections(), sections).marquee,
          );
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const messages = useMemo(
    () =>
      (marquee?.messages || []).filter(
        (message) => message.active !== false && message.text?.trim(),
      ),
    [marquee],
  );

  if (!marquee || marquee.active === false || !messages.length) return null;

  return (
    <NoticeMarquee
      badgeText={marquee.badgeText}
      messages={messages}
      speed={marquee.speed}
    />
  );
}

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const cartCount = useSelector(selectCartCount);
  const wishlistCount = useSelector(selectWishlistCount);
  const { user, isAuthenticated } = useSelector(selectAuth);
  const categories = useSelector(selectCategories);

  useEffect(() => {
    if (!categories.length) {
      dispatch(fetchCategories());
    }
  }, [dispatch, categories.length]);

  const handleLogout = async () => {
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
      await import("@/lib/firebase").then(({ signOutFirebase }) =>
        signOutFirebase(),
      );
      dispatch(logout());
      dispatch(resetCartState());
      dispatch(resetWishlistState());
      dispatch(clearMyOrderState());
      toast.success("Signed out");
      navigate("/");
    }
  };

  return (
    <>
      <TopNotice />
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="container-app">
          {/* Top row */}
          <div className="flex h-16 items-center gap-4">
            <button
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              onClick={() => dispatch(toggleMobileMenu(true))}
              aria-label="Open menu"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>

            <Logo />

            <div className="mx-2 hidden max-w-xl flex-1 md:block">
              <SearchBar />
            </div>

            <div className="ml-auto flex items-center gap-1 sm:gap-2">
              <button
                type="button"
                onClick={() => setMobileSearchOpen((prev) => !prev)}
                className={classNames(
                  "hover:text-primary-600 rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 md:hidden",
                  mobileSearchOpen && "text-primary-600 bg-slate-100",
                )}
                aria-label={mobileSearchOpen ? "Hide search" : "Show search"}
                aria-expanded={mobileSearchOpen}
                aria-controls="mobile-search"
              >
                <MagnifyingGlassIcon className="h-6 w-6" />
              </button>

              <NavLink
                to="/track-order"
                className={({ isActive }) =>
                  classNames(
                    "hover:text-primary-600 flex items-center gap-1.5 rounded-lg p-2 text-sm font-medium transition hover:bg-slate-100",
                    isActive
                      ? "text-primary-600 bg-slate-100"
                      : "text-slate-600",
                  )
                }
                aria-label="Track Order"
                title="Track Order"
              >
                <TruckIcon className="h-6 w-6" />
                <span className="hidden xl:inline">Track Order</span>
              </NavLink>

              <Link
                to="/wishlist"
                className="hover:text-primary-600 relative rounded-lg p-2 text-slate-600 transition hover:bg-slate-100"
                aria-label="Wishlist"
              >
                <HeartIcon className="h-6 w-6" />
                {wishlistCount > 0 && (
                  <span className="bg-accent-500 absolute -top-0.5 -right-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <button
                onClick={() => dispatch(toggleMiniCart(true))}
                className="hover:text-primary-600 relative rounded-lg p-2 text-slate-600 transition hover:bg-slate-100"
                aria-label="Cart"
              >
                <ShoppingBagIcon className="h-6 w-6" />
                {cartCount > 0 && (
                  <span className="bg-primary-600 absolute -top-0.5 -right-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white">
                    {cartCount}
                  </span>
                )}
              </button>

              {isAuthenticated ? (
                <Dropdown
                  trigger={
                    <span className="flex items-center gap-2 rounded-lg p-1.5 pr-2 transition hover:bg-slate-100">
                      <Avatar user={user} size="sm" />
                      <ChevronDownIcon className="hidden h-4 w-4 text-slate-400 sm:block" />
                    </span>
                  }
                >
                  <div className="border-b border-slate-100 px-4 py-3">
                    <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                      <span className="truncate">{user.name}</span>
                      <GoogleVerifiedBadge user={user} />
                    </p>
                    <p className="truncate text-xs text-slate-400">
                      {user.email}
                    </p>
                  </div>
                  {user.role === "ADMIN" && (
                    <DropdownItem onClick={() => navigate("/admin")}>
                      <Squares2X2Icon className="h-4.5 w-4.5" /> Admin Dashboard
                    </DropdownItem>
                  )}
                  <DropdownItem onClick={() => navigate("/account")}>
                    <UserCircleIcon className="h-4.5 w-4.5" /> My Account
                  </DropdownItem>
                  <DropdownItem onClick={() => navigate("/account/orders")}>
                    <ClipboardDocumentListIcon className="h-4.5 w-4.5" /> My
                    Orders
                  </DropdownItem>
                  <DropdownItem onClick={() => navigate("/account/settings")}>
                    <Cog6ToothIcon className="h-4.5 w-4.5" /> Settings
                  </DropdownItem>
                  <div className="my-1 border-t border-slate-100" />
                  <DropdownItem
                    onClick={handleLogout}
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <ArrowRightOnRectangleIcon className="h-4.5 w-4.5" /> Sign
                    out
                  </DropdownItem>
                </Dropdown>
              ) : (
                <Link
                  to="/login"
                  className="bg-primary-600 hover:bg-primary-700 ml-1 hidden items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition sm:flex"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>

          {/* Mobile search */}
          {mobileSearchOpen && (
            <div id="mobile-search" className="pb-3 md:hidden">
              <SearchBar autoFocus />
            </div>
          )}

          {/* Category nav */}
          <nav className="hidden items-center gap-6 border-t border-slate-100 py-3 lg:flex">
            {MAIN_LINKS.map(({ label, to, end, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={(state) =>
                  classNames(
                    navLinkClass(state),
                    "flex shrink-0 items-center gap-1.5 whitespace-nowrap",
                  )
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </NavLink>
            ))}
            <span className="h-4 w-px bg-slate-200" />
            {categories.slice(0, 4).map((cat) => {
              const categoryKey = cat.slug || cat.id;
              return (
                <Link
                  key={cat.id}
                  to={`/products?category=${encodeURIComponent(categoryKey)}`}
                  className="hover:text-primary-600 text-sm font-medium text-slate-500 transition"
                >
                  {cat.name}
                </Link>
              );
            })}
            {categories.length > 4 && (
              <Link
                to="/categories"
                className="hover:text-primary-600 text-sm font-semibold text-slate-700 transition"
              >
                Show More...
              </Link>
            )}
          </nav>
        </div>
      </header>
    </>
  );
}
