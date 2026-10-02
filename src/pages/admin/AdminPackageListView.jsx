import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  ArchiveBoxIcon,
  ArrowsRightLeftIcon,
  CheckCircleIcon,
  CubeIcon,
  InformationCircleIcon,
  MagnifyingGlassIcon,
  PauseCircleIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import Badge from "@/components/common/Badge";
import Button from "@/components/common/Button";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import EmptyState from "@/components/common/EmptyState";
import Input from "@/components/common/Input";
import Modal from "@/components/common/Modal";
import Select from "@/components/common/Select";
import StatCard from "@/components/common/StatCard";
import Table from "@/components/common/Table";
import {
  MOCK_PACKAGE_ITEMS,
  MOCK_PACKAGES,
} from "@/features/packages/packages.mock";
import { formatCurrency, formatDate } from "@/utils";

const MAX_ITEM_QUANTITY = 99;
const statusLabel = (status) => (status === "INACTIVE" ? "Inactive" : "Active");
const badgeColor = (status) => (status === "INACTIVE" ? "gray" : "green");

const itemById = new Map(MOCK_PACKAGE_ITEMS.map((item) => [item.id, item]));

const regularPriceOf = (items) =>
  items.reduce(
    (sum, line) =>
      sum +
      (itemById.get(line.itemId)?.unitPrice || 0) *
        (Number(line.quantity) || 0),
    0,
  );

const totalQuantityOf = (items) =>
  items.reduce((sum, line) => sum + (Number(line.quantity) || 0), 0);

const savingsPercent = (regular, price) =>
  regular > 0 && price < regular
    ? Math.round(((regular - price) / regular) * 100)
    : 0;

const makeLine = (itemId = "") => ({
  key: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  itemId,
  quantity: 1,
});

const emptyForm = () => ({
  name: "",
  description: "",
  lines: [makeLine()],
  price: "",
  status: "ACTIVE",
});

function PackageItemChips({ items }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((line) => (
        <span
          key={line.itemId}
          className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700"
        >
          {itemById.get(line.itemId)?.name ?? "Unknown item"}
          <span className="font-semibold text-slate-900">×{line.quantity}</span>
        </span>
      ))}
    </div>
  );
}

function PackagePrice({ pkg }) {
  const regular = regularPriceOf(pkg.items);
  const saving = savingsPercent(regular, pkg.price);
  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
      <span className="font-semibold text-slate-900">
        {formatCurrency(pkg.price)}
      </span>
      {saving > 0 && (
        <>
          <span className="text-xs text-slate-400 line-through">
            {formatCurrency(regular)}
          </span>
          <span className="text-xs font-medium text-emerald-600">
            Save {saving}%
          </span>
        </>
      )}
    </div>
  );
}

export default function AdminPackageListView() {
  const [packages, setPackages] = useState(MOCK_PACKAGES);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [toDelete, setToDelete] = useState(null);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return packages.filter((pkg) => {
      if (status && pkg.status !== status) return false;
      if (!query) return true;
      return (
        pkg.name.toLowerCase().includes(query) ||
        pkg.items.some((line) =>
          itemById.get(line.itemId)?.name.toLowerCase().includes(query),
        )
      );
    });
  }, [packages, search, status]);

  const overview = useMemo(() => {
    const active = packages.filter((pkg) => pkg.status === "ACTIVE").length;
    return {
      total: packages.length,
      active,
      inactive: packages.length - active,
    };
  }, [packages]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (pkg) => {
    setEditingId(pkg.id);
    setForm({
      name: pkg.name,
      description: pkg.description || "",
      lines: pkg.items.map((line) => ({
        ...makeLine(line.itemId),
        quantity: line.quantity,
      })),
      price: String(pkg.price),
      status: pkg.status,
    });
    setErrors({});
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const setField = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const updateLine = (lineKey, patch) =>
    setForm((prev) => ({
      ...prev,
      lines: prev.lines.map((line) =>
        line.key === lineKey ? { ...line, ...patch } : line,
      ),
    }));

  const addLine = () =>
    setForm((prev) => ({ ...prev, lines: [...prev.lines, makeLine()] }));

  const removeLine = (lineKey) =>
    setForm((prev) => ({
      ...prev,
      lines:
        prev.lines.length > 1
          ? prev.lines.filter((line) => line.key !== lineKey)
          : [makeLine()],
    }));

  const formItems = form.lines
    .filter((line) => line.itemId)
    .map((line) => ({ itemId: line.itemId, quantity: Number(line.quantity) }));
  const formRegularPrice = regularPriceOf(formItems);
  const formPrice = Number(form.price) || 0;
  const formSaving = savingsPercent(formRegularPrice, formPrice);
  const allItemsUsed = form.lines.length >= MOCK_PACKAGE_ITEMS.length;

  const validate = () => {
    const next = {};
    const name = form.name.trim();
    if (!name) {
      next.name = "Package name is required";
    } else if (
      packages.some(
        (pkg) =>
          pkg.id !== editingId && pkg.name.toLowerCase() === name.toLowerCase(),
      )
    ) {
      next.name = "A package with this name already exists";
    }

    if (!formItems.length) {
      next.lines = "Add at least one item";
    } else if (
      form.lines.some(
        (line) =>
          line.itemId &&
          (!Number.isInteger(Number(line.quantity)) ||
            Number(line.quantity) < 1 ||
            Number(line.quantity) > MAX_ITEM_QUANTITY),
      )
    ) {
      next.lines = `Quantity must be a whole number from 1 to ${MAX_ITEM_QUANTITY}`;
    }

    if (!(formPrice > 0)) next.price = "Enter a package price";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const save = () => {
    if (!validate()) return;
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      items: formItems,
      price: formPrice,
      status: form.status,
      updatedAt: new Date().toISOString(),
    };

    if (editingId) {
      setPackages((prev) =>
        prev.map((pkg) =>
          pkg.id === editingId ? { ...pkg, ...payload } : pkg,
        ),
      );
      toast.success("Package updated");
    } else {
      setPackages((prev) => [{ id: `pkg-${Date.now()}`, ...payload }, ...prev]);
      toast.success("Package created");
    }
    setModalOpen(false);
  };

  const toggleStatus = (pkg) => {
    const nextStatus = pkg.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    setPackages((prev) =>
      prev.map((item) =>
        item.id === pkg.id
          ? {
              ...item,
              status: nextStatus,
              updatedAt: new Date().toISOString(),
            }
          : item,
      ),
    );
    toast.success(`"${pkg.name}" is now ${statusLabel(nextStatus)}`);
  };

  const remove = () => {
    if (!toDelete) return;
    setPackages((prev) => prev.filter((pkg) => pkg.id !== toDelete.id));
    toast.success("Package deleted");
    setToDelete(null);
  };

  const renderActions = (pkg) => (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => toggleStatus(pkg)}
        className="rounded-lg p-1.5 text-slate-500 hover:bg-amber-50 hover:text-amber-700"
        title={pkg.status === "ACTIVE" ? "Set inactive" : "Set active"}
        aria-label={`${pkg.status === "ACTIVE" ? "Set inactive" : "Set active"}: ${pkg.name}`}
      >
        <ArrowsRightLeftIcon className="h-4.5 w-4.5" />
      </button>
      <button
        type="button"
        onClick={() => openEdit(pkg)}
        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-blue-600"
        title="Edit"
        aria-label={`Edit ${pkg.name}`}
      >
        <PencilSquareIcon className="h-4.5 w-4.5" />
      </button>
      <button
        type="button"
        onClick={() => setToDelete(pkg)}
        className="rounded-lg p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600"
        title="Delete"
        aria-label={`Delete ${pkg.name}`}
      >
        <TrashIcon className="h-4.5 w-4.5" />
      </button>
    </div>
  );

  const columns = [
    {
      key: "name",
      header: "Package",
      cellClassName: "whitespace-normal min-w-56",
      render: (pkg) => (
        <div className="min-w-0">
          <p className="font-medium text-slate-800">{pkg.name}</p>
          <p className="line-clamp-1 text-xs text-slate-400">
            {pkg.description || `Updated ${formatDate(pkg.updatedAt)}`}
          </p>
        </div>
      ),
    },
    {
      key: "items",
      header: "Items",
      cellClassName: "whitespace-normal min-w-64",
      render: (pkg) => <PackageItemChips items={pkg.items} />,
    },
    {
      key: "quantity",
      header: "Qty",
      render: (pkg) => (
        <span className="text-slate-600">{totalQuantityOf(pkg.items)} pcs</span>
      ),
    },
    {
      key: "price",
      header: "Price",
      render: (pkg) => <PackagePrice pkg={pkg} />,
    },
    {
      key: "status",
      header: "Status",
      render: (pkg) => (
        <Badge color={badgeColor(pkg.status)}>{statusLabel(pkg.status)}</Badge>
      ),
    },
    { key: "actions", header: "Actions", render: renderActions },
  ];

  const renderCard = (pkg) => (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium text-slate-800">{pkg.name}</p>
          <p className="text-xs text-slate-400">
            {totalQuantityOf(pkg.items)} pcs · Updated{" "}
            {formatDate(pkg.updatedAt)}
          </p>
        </div>
        <Badge color={badgeColor(pkg.status)}>{statusLabel(pkg.status)}</Badge>
      </div>
      <div className="mt-3">
        <PackageItemChips items={pkg.items} />
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
        <PackagePrice pkg={pkg} />
        {renderActions(pkg)}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Packages"
        subtitle={`${packages.length} package${packages.length === 1 ? "" : "s"}`}
        actions={
          <Button leftIcon={PlusIcon} onClick={openCreate}>
            Create Package
          </Button>
        }
      />

      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
        <InformationCircleIcon className="mt-0.5 h-5 w-5 shrink-0" />
        <p>
          Preview mode: packages use sample data and are not saved yet. Changes
          reset when you leave this page.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Packages"
          value={overview.total}
          icon={ArchiveBoxIcon}
          tone="blue"
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
          icon={PauseCircleIcon}
          tone="yellow"
        />
        <StatCard
          label="Available Items"
          value={MOCK_PACKAGE_ITEMS.length}
          icon={CubeIcon}
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
              placeholder="Search packages or items…"
              aria-label="Search packages"
              className="input-base pl-11"
            />
          </div>
          <div className="sm:w-44">
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              aria-label="Filter by status"
            >
              <option value="">All status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
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
          packages.length ? (
            <EmptyState
              title="No packages found"
              description="Try a different search or status filter."
            />
          ) : (
            <EmptyState
              icon={ArchiveBoxIcon}
              title="No packages yet"
              description="Bundle items into combo packages customers can buy together."
              action={
                <Button leftIcon={PlusIcon} onClick={openCreate}>
                  Create Package
                </Button>
              }
            />
          )
        }
      />

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingId ? "Edit package" : "Create package"}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button onClick={save}>
              {editingId ? "Save changes" : "Create package"}
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          <Input
            label="Package name"
            value={form.name}
            onChange={setField("name")}
            placeholder="e.g. Chador + 2 Pieces Porda"
            maxLength={120}
            error={errors.name}
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={setField("description")}
              rows={2}
              maxLength={300}
              placeholder="Optional short note shown with the package"
              className="input-base resize-none"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-slate-700">
                Package items
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                leftIcon={PlusIcon}
                onClick={addLine}
                disabled={allItemsUsed}
              >
                Add item
              </Button>
            </div>
            <div className="space-y-2">
              {form.lines.map((line, idx) => {
                const item = itemById.get(line.itemId);
                const usedElsewhere = new Set(
                  form.lines
                    .filter((other) => other.key !== line.key && other.itemId)
                    .map((other) => other.itemId),
                );
                return (
                  <div
                    key={line.key}
                    className="grid grid-cols-[minmax(0,1fr)_5.5rem_auto] items-start gap-2 rounded-xl border border-slate-200 p-2 sm:grid-cols-[minmax(0,1fr)_6rem_7rem_auto] sm:items-center"
                  >
                    <Select
                      value={line.itemId}
                      onChange={(e) =>
                        updateLine(line.key, { itemId: e.target.value })
                      }
                      aria-label={`Item ${idx + 1}`}
                    >
                      <option value="">Select an item…</option>
                      {MOCK_PACKAGE_ITEMS.map((option) => (
                        <option
                          key={option.id}
                          value={option.id}
                          disabled={usedElsewhere.has(option.id)}
                        >
                          {option.name} · {option.variant}
                        </option>
                      ))}
                    </Select>
                    <Input
                      type="number"
                      min="1"
                      max={MAX_ITEM_QUANTITY}
                      step="1"
                      value={line.quantity}
                      onChange={(e) =>
                        updateLine(line.key, { quantity: e.target.value })
                      }
                      aria-label={`Quantity for item ${idx + 1}`}
                    />
                    <span className="hidden text-right text-sm text-slate-600 sm:block">
                      {item
                        ? formatCurrency(
                            item.unitPrice * (Number(line.quantity) || 0),
                          )
                        : "—"}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeLine(line.key)}
                      className="flex h-10.5 w-10 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                      aria-label={`Remove item ${idx + 1}`}
                      title="Remove"
                    >
                      <TrashIcon className="h-4.5 w-4.5" />
                    </button>
                  </div>
                );
              })}
            </div>
            {errors.lines && (
              <p className="mt-1.5 text-xs text-red-600">{errors.lines}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Package price (BDT)"
              type="number"
              min="0"
              step="1"
              value={form.price}
              onChange={setField("price")}
              placeholder={
                formRegularPrice ? String(formRegularPrice) : "e.g. 1950"
              }
              error={errors.price}
            />
            <Select
              label="Status"
              value={form.status}
              onChange={setField("status")}
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </Select>
          </div>

          <div className="space-y-1.5 rounded-xl bg-slate-50 p-4 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Items total ({totalQuantityOf(formItems)} pcs)</span>
              <span>{formatCurrency(formRegularPrice)}</span>
            </div>
            <div className="flex justify-between font-semibold text-slate-900">
              <span>Package price</span>
              <span>{formatCurrency(formPrice)}</span>
            </div>
            {formSaving > 0 && (
              <p className="text-xs font-medium text-emerald-600">
                Customers save {formatCurrency(formRegularPrice - formPrice)} (
                {formSaving}%)
              </p>
            )}
            {formPrice > formRegularPrice && formRegularPrice > 0 && (
              <p className="text-xs font-medium text-amber-600">
                The package price is higher than buying the items separately.
              </p>
            )}
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={remove}
        title="Delete package?"
        message={`"${toDelete?.name}" will be removed.`}
        confirmText="Delete"
      />
    </div>
  );
}
