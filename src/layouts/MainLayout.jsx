import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MobileMenu from "@/components/layout/MobileMenu";
import MiniCart from "@/components/cart/MiniCart";

export default function MainLayout() {
  const { mobileMenuOpen, miniCartOpen } = useSelector((state) => state.ui);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />
      <MobileMenu open={mobileMenuOpen} />
      <MiniCart open={miniCartOpen} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
