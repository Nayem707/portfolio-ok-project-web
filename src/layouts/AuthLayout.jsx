import { Link, Outlet } from "react-router-dom";
import Logo from "@/components/layout/Logo";

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Brand panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-primary-700 p-12 text-white lg:flex">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-primary-900" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1000&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="relative">
          <Logo textClassName="text-white" />
        </div>
        <div className="relative max-w-md">
          <h2 className="text-3xl font-bold leading-tight">
            Shopping made simple, delightful, and fast.
          </h2>
          <p className="mt-4 text-primary-100">
            Discover thousands of products, track your orders, and enjoy a
            seamless checkout experience — all in one place.
          </p>
        </div>
        <div className="relative flex gap-8 text-sm text-primary-100">
          <div>
            <p className="text-2xl font-bold text-white">10k+</p>
            <p>Products</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">50k+</p>
            <p>Happy Customers</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">4.9★</p>
            <p>Average Rating</p>
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex w-full flex-col items-center justify-center p-6 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8 flex justify-center lg:hidden">
            <Logo />
          </div>
          <Outlet />
          <p className="mt-8 text-center text-xs text-slate-400">
            <Link to="/" className="hover:text-primary-600">
              ← Back to store
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
