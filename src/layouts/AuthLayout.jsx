import { Link, Outlet, useNavigate } from "react-router-dom";
import Logo from "@/components/navigation/Logo";

export default function AuthLayout() {
  const navigate = useNavigate();

  const handleBackToStore = () => {
    navigate(-1);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Brand panel */}
      <div className="bg-primary-700 relative hidden w-1/2 flex-col justify-between overflow-hidden p-12 text-white lg:flex">
        <div className="from-primary-600/20 to-primary-900 absolute inset-0 bg-gradient-to-br" />
        <div
          className="absolute inset-0 opacity-50"
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
        <div className="relative max-w-xl">
          <h2 className="text-5xl leading-tight font-bold">
            Shopping made simple, delightful, and fast.
          </h2>
          <p className="text-primary-100 mt-4">
            Discover thousands of products, track your orders, and enjoy a
            seamless checkout experience — all in one place.
          </p>
        </div>
        <div className="text-primary-100 relative flex gap-8 text-sm">
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
            <a
              href="#"
              onClick={handleBackToStore}
              className="hover:text-primary-600"
            >
              ← Back to store
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
