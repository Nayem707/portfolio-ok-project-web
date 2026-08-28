import { useParams, useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ArrowLeftIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import EmptyState from "@/components/common/EmptyState";
import OrderStatusBadge from "@/components/common/OrderStatusBadge";
import { getUserById } from "@/data/users";
import { selectOrders } from "@/store/orders";
import { formatCurrency, formatDate } from "@/utils";

export default function AdminUserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = getUserById(id);
  const orders = useSelector(selectOrders).filter((o) => o.customer?.id === id);

  if (!user) {
    return (
      <EmptyState
        title="User not found"
        action={
          <Button as={Link} to="/admin/users">
            Back to users
          </Button>
        }
      />
    );
  }

  const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate("/admin/users")}
        className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
      >
        <ArrowLeftIcon className="h-4 w-4" /> Back to users
      </button>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile */}
        <div className="card p-6 text-center">
          <img
            src={user.avatar}
            alt={user.name}
            className="mx-auto h-24 w-24 rounded-full object-cover"
          />
          <h1 className="mt-4 text-xl font-bold text-slate-900">{user.name}</h1>
          <div className="mt-2 flex items-center justify-center gap-2">
            <Badge color={user.role === "ADMIN" ? "indigo" : "gray"}>
              {user.role}
            </Badge>
            <Badge color={user.status === "Active" ? "green" : "red"} dot>
              {user.status}
            </Badge>
          </div>

          <div className="mt-6 space-y-3 border-t border-slate-100 pt-6 text-left text-sm">
            <p className="flex items-center gap-2.5 text-slate-600">
              <EnvelopeIcon className="h-4.5 w-4.5 text-slate-400" />{" "}
              {user.email}
            </p>
            <p className="flex items-center gap-2.5 text-slate-600">
              <PhoneIcon className="h-4.5 w-4.5 text-slate-400" /> {user.phone}
            </p>
            <p className="flex items-center gap-2.5 text-slate-600">
              <CalendarDaysIcon className="h-4.5 w-4.5 text-slate-400" /> Joined{" "}
              {formatDate(user.createdAt)}
            </p>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 border-t border-slate-100 pt-6">
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {orders.length}
              </p>
              <p className="text-xs text-slate-400">Orders</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {formatCurrency(totalSpent)}
              </p>
              <p className="text-xs text-slate-400">Total spent</p>
            </div>
          </div>
        </div>

        {/* Orders */}
        <div className="card lg:col-span-2">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="font-semibold text-slate-900">Order History</h2>
          </div>
          {orders.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title="No orders"
                description="This user hasn’t placed any orders yet."
              />
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {orders.map((order) => (
                <li key={order.id}>
                  <Link
                    to={`/admin/orders/${order.id}`}
                    className="flex items-center justify-between px-6 py-4 transition hover:bg-slate-50"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {order.id}
                      </p>
                      <p className="text-xs text-slate-400">
                        {formatDate(order.date)} · {order.items.length} item(s)
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <OrderStatusBadge status={order.status} />
                      <span className="font-semibold text-slate-800">
                        {formatCurrency(order.total)}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
