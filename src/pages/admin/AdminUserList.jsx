import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { MagnifyingGlassIcon, EyeIcon } from "@heroicons/react/24/outline";
import Table from "@/components/common/Table";
import Select from "@/components/common/Select";
import Badge from "@/components/common/Badge";
import Button from "@/components/common/Button";
import EmptyState from "@/components/common/EmptyState";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { users as seedUsers } from "@/data/users";
import { formatDate } from "@/utils";

export default function AdminUserList() {
  const [users, setUsers] = useState(seedUsers);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");

  const filtered = useMemo(
    () =>
      users.filter(
        (u) =>
          (u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase())) &&
          (!role || u.role === role),
      ),
    [users, search, role],
  );

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
      render: (u) => (
        <div className="flex items-center gap-2">
          <Link
            to={`/admin/users/${u.id}`}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-primary-600"
          >
            <EyeIcon className="h-4.5 w-4.5" />
          </Link>
          <Button
            size="sm"
            variant="outline"
            onClick={() => toggleStatus(u.id)}
          >
            {u.status === "Active" ? "Deactivate" : "Activate"}
          </Button>
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
        <div className="flex gap-2">
          <Link
            to={`/admin/users/${u.id}`}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
          >
            <EyeIcon className="h-4.5 w-4.5" />
          </Link>
          <Button
            size="sm"
            variant="outline"
            onClick={() => toggleStatus(u.id)}
          >
            {u.status === "Active" ? "Deactivate" : "Activate"}
          </Button>
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

      <div className="card p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
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
        </div>
      </div>

      <Table
        columns={columns}
        data={filtered}
        rowKey="id"
        renderCard={renderCard}
        emptyState={
          <EmptyState
            title="No users found"
            description="Try a different search or filter."
          />
        }
      />
    </div>
  );
}
