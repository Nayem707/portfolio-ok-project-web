import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  MagnifyingGlassIcon,
  EyeIcon,
  UsersIcon,
  UserCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import Table from "@/components/common/Table";
import Select from "@/components/common/Select";
import Badge from "@/components/common/Badge";
import Button from "@/components/common/Button";
import EmptyState from "@/components/common/EmptyState";
import StatCard from "@/components/common/StatCard";
import Pagination from "@/components/common/Pagination";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { users as seedUsers } from "@/data/users";
import { formatDate } from "@/utils";

const PAGE_SIZE_OPTIONS = [10, 20, 30, 50];

export default function AdminUserListView() {
  const [users, setUsers] = useState(seedUsers);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const overview = useMemo(() => {
    const active = users.filter((u) => u.status === "Active").length;
    const inactive = users.filter((u) => u.status === "Inactive").length;
    const admins = users.filter((u) => u.role === "ADMIN").length;
    const customers = users.filter((u) => u.role === "USER").length;

    return {
      total: users.length,
      active,
      inactive,
      admins,
      customers,
    };
  }, [users]);

  const filtered = useMemo(
    () =>
      users.filter(
        (u) =>
          (u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase())) &&
          (!role || u.role === role) &&
          (!statusFilter || u.status === statusFilter),
      ),
    [users, search, role, statusFilter],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pagedUsers = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize],
  );

  useEffect(() => {
    setPage(1);
  }, [search, role, statusFilter, pageSize]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const toggleStatus = (id) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, status: u.status === "Active" ? "Inactive" : "Active" }
          : u,
      ),
    );
    toast.success("User status updated");
  };

  const columns = [
    {
      key: "user",
      header: "User",
      render: (u) => (
        <div className="flex items-center gap-3">
          <img
            src={u.avatar}
            alt={u.name}
            className="h-9 w-9 rounded-full object-cover"
          />
          <div>
            <p className="font-medium text-slate-800">{u.name}</p>
            <p className="text-xs text-slate-400">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (u) => (
        <Badge color={u.role === "ADMIN" ? "indigo" : "gray"}>{u.role}</Badge>
      ),
    },
    {
      key: "orders",
      header: "Orders",
      render: (u) => <span className="text-slate-600">{u.orders}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (u) => (
        <Badge color={u.status === "Active" ? "green" : "red"} dot>
          {u.status}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      header: "Registered",
      render: (u) => (
        <span className="text-slate-500">{formatDate(u.createdAt)}</span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      cellClassName: "text-right align-middle",
      render: (u) => (
        <div className="flex items-center justify-end gap-3">
          <Link
            to={`/admin/users/${u.id}`}
            className="hover:text-primary-600 rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
          >
            <EyeIcon className="h-4.5 w-4.5" />
          </Link>
          <button
            type="button"
            onClick={() => toggleStatus(u.id)}
            aria-label={
              u.status === "Active" ? "Deactivate user" : "Activate user"
            }
            className={`relative inline-flex h-5.5 w-10 items-center rounded-full transition-colors duration-200 ${
              u.status === "Active" ? "bg-primary-500" : "bg-slate-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                u.status === "Active" ? "translate-x-5" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      ),
    },
  ];

  const renderCard = (u) => (
    <div className="card p-4">
      <div className="flex items-center gap-3">
        <img
          src={u.avatar}
          alt={u.name}
          className="h-11 w-11 rounded-full object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="font-medium text-slate-800">{u.name}</p>
          <p className="truncate text-xs text-slate-400">{u.email}</p>
        </div>
        <Badge color={u.status === "Active" ? "green" : "red"} dot>
          {u.status}
        </Badge>
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
        <Badge color={u.role === "ADMIN" ? "indigo" : "gray"}>{u.role}</Badge>
        <div className="flex items-center gap-2">
          <Link
            to={`/admin/users/${u.id}`}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
          >
            <EyeIcon className="h-4.5 w-4.5" />
          </Link>
          <button
            type="button"
            onClick={() => toggleStatus(u.id)}
            aria-label={
              u.status === "Active" ? "Deactivate user" : "Activate user"
            }
            className={`relative inline-flex h-5.5 w-10 items-center rounded-full transition-colors duration-200 ${
              u.status === "Active" ? "bg-primary-500" : "bg-slate-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                u.status === "Active" ? "translate-x-5" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Users"
        subtitle={`${users.length} registered users`}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard
          label="Total Users"
          value={overview.total}
          icon={UsersIcon}
          tone="primary"
        />
        <StatCard
          label="Active"
          value={overview.active}
          icon={CheckCircleIcon}
          tone="green"
        />
        <StatCard
          label="Inactive"
          value={overview.inactive}
          icon={XCircleIcon}
          tone="red"
        />
        <StatCard
          label="Admins"
          value={overview.admins}
          icon={ShieldCheckIcon}
          tone="indigo"
        />
        <StatCard
          label="Customers"
          value={overview.customers}
          icon={UserCircleIcon}
          tone="blue"
        />
      </div>

      <div className="card p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-3.5 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email…"
              className="input-base pl-11"
            />
          </div>
          <div className="sm:w-44">
            <Select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="">All roles</option>
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
            </Select>
          </div>
          <div className="sm:w-44">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
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
        data={pagedUsers}
        rowKey="id"
        renderCard={renderCard}
        emptyState={
          <EmptyState
            title="No users found"
            description="Try a different search or filter."
          />
        }
      />

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}
