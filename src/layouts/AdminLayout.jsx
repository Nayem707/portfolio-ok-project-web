import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";

export default function AdminLayout() {
  const { adminSidebarOpen } = useSelector((state) => state.ui);

  return (
    <div className="min-h-screen bg-slate-100">
      <AdminSidebar open={adminSidebarOpen} />
      <div className="lg:pl-64">
        <AdminTopbar />
        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
