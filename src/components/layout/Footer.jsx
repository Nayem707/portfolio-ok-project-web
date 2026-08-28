import { Link } from "react-router-dom";
import { useState } from "react";
import toast from "react-hot-toast";
import {
  EnvelopeIcon,
  MapPinIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";
import Logo from "@/components/layout/Logo";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";

const columns = [
  {
    title: "Shop",
    links: [
      { label: "All Products", to: "/products" },
      { label: "Categories", to: "/categories" },
      { label: "New Arrivals", to: "/products?sort=newest" },
      { label: "Deals", to: "/products" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "My Account", to: "/account" },
      { label: "Orders", to: "/account/orders" },
      { label: "Wishlist", to: "/wishlist" },
      { label: "Cart", to: "/cart" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", to: "/" },
      { label: "Careers", to: "/" },
      { label: "Privacy Policy", to: "/" },
      { label: "Terms of Service", to: "/" },
    ],
  },
];

export default function Footer() {
  const [email, setEmail] = useState("");

  const subscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    toast.success("Subscribed to our newsletter!");
    setEmail("");
  };

  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="container-app py-12">
        <div className="grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Logo />
            <p className="mt-4 max-w-sm text-sm text-slate-500">
              Your modern destination for quality products at fair prices. Fast
              shipping, easy returns, and a shopping experience you’ll love.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-slate-500">
              <li className="flex items-center gap-2">
                <MapPinIcon className="h-4.5 w-4.5 text-slate-400" /> 123 Market
                St, San Francisco, CA
              </li>
              <li className="flex items-center gap-2">
                <PhoneIcon className="h-4.5 w-4.5 text-slate-400" /> +1 (800)
                555-0199
              </li>
              <li className="flex items-center gap-2">
                <EnvelopeIcon className="h-4.5 w-4.5 text-slate-400" />{" "}
                support@shoply.com
              </li>
            </ul>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-slate-800">
                {col.title}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-slate-500 transition hover:text-primary-600"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl bg-slate-900 p-6 sm:p-8">
          <div className="flex flex-col items-center gap-4 text-center md:flex-row md:justify-between md:text-left">
            <div>
              <h3 className="text-lg font-semibold text-white">
                Subscribe to our newsletter
              </h3>
              <p className="mt-1 text-sm text-slate-300">
                Get the latest deals and product drops in your inbox.
              </p>
            </div>
            <form onSubmit={subscribe} className="flex w-full max-w-md gap-2">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="bg-white"
              />
              <Button type="submit" variant="accent" className="shrink-0">
                Subscribe
              </Button>
            </form>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100">
        <div className="container-app flex flex-col items-center justify-between gap-3 py-5 text-sm text-slate-400 sm:flex-row">
          <p>© {new Date().getFullYear()} Shoply. All rights reserved.</p>
          <p>Built with React, Redux Toolkit & Tailwind CSS.</p>
        </div>
      </div>
    </footer>
  );
}
