import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  MagnifyingGlassIcon,
  EyeIcon,
  ShoppingCartIcon,
  ClockIcon,
  CheckCircleIcon,
  TruckIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import StatCard from "@/components/common/StatCard";
import Table from "@/components/common/Table";
import Pagination from "@/components/common/Pagination";
import Select from "@/components/common/Select";
import OrderStatusBadge from "@/components/common/OrderStatusBadge";
import EmptyState from "@/components/common/EmptyState";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { selectOrders } from "@/features/orders";
import { formatCurrency, formatDate } from "@/utils";
import { ORDER_STATUS, PAYMENT_STATUS } from "@/constants";

const PAGE_SIZE_OPTIONS = [10, 20, 30, 50];

export default function AdminOrderListView() {
  const orders = useSelector(selectOrders);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const overview = useMemo(() => {
    const pending = orders.filter(
      (o) => o.status === ORDER_STATUS.PENDING,
    ).length;
    const processing = orders.filter(
      (o) => o.status === ORDER_STATUS.PROCESSING,
    ).length;
    const shipped = orders.filter(
      (o) => o.status === ORDER_STATUS.SHIPPED,
    ).length;
    const delivered = orders.filter(
      (o) => o.status === ORDER_STATUS.DELIVERED,
    ).length;
    const cancelled = orders.filter(
      (o) => o.status === ORDER_STATUS.CANCELLED,
    ).length;

    return {
      total: orders.length,
      pending,
      processing,
      shipped,
      delivered,
      cancelled,
    };
  }, [orders]);

  const filtered = useMemo(
    () =>
      orders.filter(
        (o) =>
          (o.id.toLowerCase().includes(search.toLowerCase()) ||
            o.customer.name.toLowerCase().includes(search.toLowerCase())) &&
          (!status || o.status === status) &&
          (!paymentStatus || o.paymentStatus === paymentStatus),
      ),
    [orders, search, status, paymentStatus],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pagedOrders = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize],
  );

  useEffect(() => {
    setPage(1);
  }, [search, status, paymentStatus, pageSize]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const columns = [
    {
      key: "id",
      header: "Order",
      render: (o) => (
        <span className="font-semibold text-slate-800">{o.id}</span>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      render: (o) => (
        <div>
          <p className="font-medium text-slate-700">{o.customer.name}</p>
          <p className="text-xs text-slate-400">{o.customer.email}</p>
        </div>
      ),
    },
    {
      key: "date",
      header: "Date",
      render: (o) => (
        <span className="text-slate-500">{formatDate(o.date)}</span>
      ),
    },
    {
      key: "total",
      header: "Total",
      render: (o) => (
        <span className="font-medium">{formatCurrency(o.total)}</span>
      ),
    },
    {
      key: "payment",
      header: "Payment",
      render: (o) => (
        <OrderStatusBadge status={o.paymentStatus} type="payment" />
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (o) => <OrderStatusBadge status={o.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      render: (o) => (
        <Link
          to={`/admin/orders/${o.id}`}
          className="hover:text-primary-600 inline-flex rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
        >
          <EyeIcon className="h-4.5 w-4.5" />
        </Link>
      ),
    },
  ];

  const renderCard = (o) => (
    <Link to={`/admin/orders/${o.id}`} className="card block p-4">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-slate-800">{o.id}</span>
        <OrderStatusBadge status={o.status} />
      </div>
      <p className="mt-1 text-sm text-slate-600">{o.customer.name}</p>
      <div className="mt-2 flex items-center justify-between text-sm">
        <span className="text-slate-400">{formatDate(o.date)}</span>
        <span className="font-semibold text-slate-900">
          {formatCurrency(o.total)}
        </span>
      </div>
    </Link>
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Orders"
        subtitle={`${orders.length} total orders`}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="Total Orders"
          value={overview.total}
          icon={ShoppingCartIcon}
          tone="primary"
        />
        <StatCard
          label="Pending"
          value={overview.pending}
          icon={ClockIcon}
          tone="yellow"
        />
        <StatCard
          label="Processing"
          value={overview.processing}
          icon={ClockIcon}
          tone="orange"
        />
        <StatCard
          label="Shipped"
          value={overview.shipped}
          icon={TruckIcon}
          tone="blue"
        />
        <StatCard
          label="Delivered"
          value={overview.delivered}
          icon={CheckCircleIcon}
          tone="green"
        />
        <StatCard
          label="Cancelled"
          value={overview.cancelled}
          icon={XCircleIcon}
          tone="purple"
        />
      </div>

      <div className="card p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-3.5 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order ID or customer…"
              className="input-base pl-11"
            />
          </div>
          <div className="sm:w-52">
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All statuses</option>
              {Object.values(ORDER_STATUS).map((s) => (
                <option key={s}>{s}</option>
              ))}
            </Select>
          </div>
          <div className="sm:w-44">
            <Select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
            >
              <option value="">All payment</option>
              {Object.values(PAYMENT_STATUS).map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </Select>
          </div>
          <div className="sm:w-36">
            <Select
              value={String(pageSize)}
              onChange={(e) => setPageSize(Number(e.target.value))}
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  Show {size}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      <Table
        columns={columns}
        data={pagedOrders}
        rowKey="id"
        renderCard={renderCard}
        emptyState={
          <EmptyState
            title="No orders found"
            description="Try a different search or filter."
          />
        }
      />

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}
