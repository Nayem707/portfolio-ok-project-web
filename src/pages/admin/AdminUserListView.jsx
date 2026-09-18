import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
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
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import StatCard from "@/components/common/StatCard";
import Pagination from "@/components/common/Pagination";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import Avatar from "@/components/common/Avatar";
import {
  fetchAdminUsers,
  selectAdminUsers,
  selectAdminUsersError,
  selectAdminUsersLoading,
  updateAdminUserStatus,
} from "@/features/users";
import { formatDate } from "@/utils";
import { USER_STATUS } from "@/constants";

const PAGE_SIZE_OPTIONS = [10, 20, 30, 50];
const ADMIN_USER_LIMIT = 100;

export default function AdminUserListView() {
  const dispatch = useDispatch();
  const users = useSelector(selectAdminUsers);
  const loading = useSelector(selectAdminUsersLoading);
  const error = useSelector(selectAdminUsersError);

  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    dispatch(fetchAdminUsers({ page: 1, limit: ADMIN_USER_LIMIT }));
  }, [dispatch]);

  const overview = useMemo(() => {
    const active = users.filter(
      (u) => u.status === USER_STATUS.ACTIVE,
    ).length;
    const inactive = users.filter(
      (u) => u.status === USER_STATUS.INACTIVE,
    ).length;
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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      const matchesSearch =
        !q ||
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q);
      const matchesRole = !role || u.role === role;
      const matchesStatus = !statusFilter || u.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, role, statusFilter]);

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

  const toggleStatus = async (user) => {
    const nextStatus =
      user.status === USER_STATUS.ACTIVE
        ? USER_STATUS.INACTIVE
        : USER_STATUS.ACTIVE;
    setUpdatingId(user.id);
    try {
      await dispatch(
        updateAdminUserStatus({ id: user.id, status: nextStatus }),
      ).unwrap();
      toast.success(`User marked as ${nextStatus}`);
    } catch (err) {
      toast.error(err || "Failed to update user status");
    } finally {
      setUpdatingId(null);
    }
  };

  const columns = [
    {
      key: "user",
      header: "User",
      render: (u) => (
        <div className="flex items-center gap-3">
          <Avatar user={u} size="md" />
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
        <Badge color={u.status === USER_STATUS.ACTIVE ? "green" : "red"} dot>
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
            disabled={updatingId === u.id}
            onClick={() => toggleStatus(u)}
            aria-label={
              u.status === USER_STATUS.ACTIVE
                ? "Deactivate user"
                : "Activate user"
            }
            className={`relative inline-flex h-5.5 w-10 items-center rounded-full transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${
              u.status === USER_STATUS.ACTIVE
                ? "bg-primary-500"
                : "bg-slate-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                u.status === USER_STATUS.ACTIVE
                  ? "translate-x-5"
                  : "translate-x-1"
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
        <Avatar user={u} size="md" />
        <div className="min-w-0 flex-1">
          <p className="font-medium text-slate-800">{u.name}</p>
          <p className="truncate text-xs text-slate-400">{u.email}</p>
        </div>
        <Badge color={u.status === USER_STATUS.ACTIVE ? "green" : "red"} dot>
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
            disabled={updatingId === u.id}
            onClick={() => toggleStatus(u)}
            aria-label={
              u.status === USER_STATUS.ACTIVE
                ? "Deactivate user"
                : "Activate user"
            }
            className={`relative inline-flex h-5.5 w-10 items-center rounded-full transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${
              u.status === USER_STATUS.ACTIVE
                ? "bg-primary-500"
                : "bg-slate-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                u.status === USER_STATUS.ACTIVE
                  ? "translate-x-5"
                  : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );

  if (loading && users.length === 0) {
    return <LoadingSpinner className="py-16" label="Loading users..." />;
  }

  if (error && users.length === 0) {
    return (
      <ErrorState
        title="Could not load users"
        description={error}
        onRetry={() =>
          dispatch(fetchAdminUsers({ page: 1, limit: ADMIN_USER_LIMIT }))
        }
      />
    );
  }

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
              <option value={USER_STATUS.ACTIVE}>Active</option>
              <option value={USER_STATUS.INACTIVE}>Inactive</option>
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
