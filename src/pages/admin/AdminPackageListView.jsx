import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  ArchiveBoxIcon,
  ArrowsRightLeftIcon,
  CheckCircleIcon,
  CubeIcon,
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
import LoadingSpinner from "@/components/common/LoadingSpinner";
import Modal from "@/components/common/Modal";
import Select from "@/components/common/Select";
import StatCard from "@/components/common/StatCard";
import Table from "@/components/common/Table";
import { api } from "@/services/api";
import { formatCurrency, formatDate } from "@/utils";

const MAX_ITEM_QUANTITY = 99;
const statusLabel = (status) => (status === "INACTIVE" ? "Inactive" : "Active");
const badgeColor = (status) => (status === "INACTIVE" ? "gray" : "green");

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.error?.details?.[0]?.message ||
  error?.response?.data?.error?.message ||
  fallback;

const totalQuantityOf = (items) =>
  (items || []).reduce((sum, line) => sum + (Number(line.quantity) || 0), 0);

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
      {(items || []).map((line, idx) => (
        <span
          key={line.id || line.packageItemId || idx}
          className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700"
        >
          {line.name ?? "Unknown item"}
          <span className="font-semibold text-slate-900">×{line.quantity}</span>
        </span>
      ))}
    </div>
  );
}

function PackagePrice({ pkg }) {
  const regular = Number(pkg.regularPrice) || 0;
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
  const [packages, setPackages] = useState([]);
  const [catalogue, setCatalogue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [toDelete, setToDelete] = useState(null);
  const [itemsModalOpen, setItemsModalOpen] = useState(false);
  const [itemForm, setItemForm] = useState({ name: "", variant: "", unitPrice: "" });
  const [itemSaving, setItemSaving] = useState(false);

  const itemById = useMemo(
    () => new Map(catalogue.map((item) => [item.id, item])),
    [catalogue],
  );

  const loadPackages = async () => {
    const list = await api.getPackages();
    setPackages(Array.isArray(list) ? list : []);
  };

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([api.getPackages(), api.getPackageItems()])
      .then(([pkgs, items]) => {
        if (!active) return;
        setPackages(Array.isArray(pkgs) ? pkgs : []);
        setCatalogue(Array.isArray(items) ? items : []);
      })
      .catch((error) => {
        if (active) toast.error(getErrorMessage(error, "Failed to load packages"));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return packages.filter((pkg) => {
      if (status && pkg.status !== status) return false;
      if (!query) return true;
      return (
        pkg.name.toLowerCase().includes(query) ||
        (pkg.items || []).some((line) =>
          line.name?.toLowerCase().includes(query),
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
      lines: (pkg.items || []).map((line) => ({
        ...makeLine(line.packageItemId),
        quantity: line.quantity,
      })),
      price: String(pkg.price),
      status: pkg.status,
    });
    setErrors({});
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
  };

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
  const formRegularPrice = formItems.reduce(
    (sum, line) =>
      sum + (itemById.get(line.itemId)?.unitPrice || 0) * (line.quantity || 0),
    0,
  );
  const formPrice = Number(form.price) || 0;
  const formSaving = savingsPercent(formRegularPrice, formPrice);
  const allItemsUsed =
    catalogue.length > 0 && form.lines.length >= catalogue.length;

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

  const save = async () => {
    if (!validate()) return;
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      items: formItems.map((line) => ({
        packageItemId: line.itemId,
        quantity: line.quantity,
      })),
      price: formPrice,
      status: form.status,
    };

    setSaving(true);
    try {
      if (editingId) {
        await api.updatePackage(editingId, payload);
        toast.success("Package updated");
      } else {
        await api.createPackage(payload);
        toast.success("Package created");
      }
      await loadPackages();
      setModalOpen(false);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to save package"));
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (pkg) => {
    const nextStatus = pkg.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await api.updatePackage(pkg.id, { status: nextStatus });
      setPackages((prev) =>
        prev.map((item) =>
          item.id === pkg.id ? { ...item, status: nextStatus } : item,
        ),
      );
      toast.success(`"${pkg.name}" is now ${statusLabel(nextStatus)}`);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update status"));
    }
  };

  const remove = async () => {
    if (!toDelete) return;
    try {
      await api.deletePackage(toDelete.id);
      setPackages((prev) => prev.filter((pkg) => pkg.id !== toDelete.id));
      toast.success("Package deleted");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to delete package"));
    } finally {
      setToDelete(null);
    }
  };

  const createComponent = async () => {
    const name = itemForm.name.trim();
    const unitPrice = Number(itemForm.unitPrice);
    if (!name || !(unitPrice >= 0) || Number.isNaN(unitPrice)) {
      toast.error("Enter a component name and a valid price");
      return;
    }
    setItemSaving(true);
    try {
      const created = await api.createPackageItem({
        name,
        variant: itemForm.variant.trim() || undefined,
        unitPrice,
      });
      setCatalogue((prev) => [...prev, created].sort((a, b) =>
        a.name.localeCompare(b.name),
      ));
      setItemForm({ name: "", variant: "", unitPrice: "" });
      toast.success("Component added");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to add component"));
    } finally {
      setItemSaving(false);
    }
  };

  const removeComponent = async (item) => {
    try {
      await api.deletePackageItem(item.id);
      setCatalogue((prev) => prev.filter((c) => c.id !== item.id));
      toast.success("Component removed");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to remove component"));
    }
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
    {
      key: "products",
      header: "Used by",
      render: (pkg) => (
        <span className="text-slate-600">
          {pkg.productCount || 0} product{pkg.productCount === 1 ? "" : "s"}
        </span>
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
      <div className="mt-2 text-xs text-slate-400">
        Used by {pkg.productCount || 0} product
        {pkg.productCount === 1 ? "" : "s"}
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
        <PackagePrice pkg={pkg} />
        {renderActions(pkg)}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Packages"
        subtitle={`${packages.length} package${packages.length === 1 ? "" : "s"}`}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" leftIcon={CubeIcon} onClick={() => setItemsModalOpen(true)}>
              Manage Items
            </Button>
            <Button leftIcon={PlusIcon} onClick={openCreate}>
              Create Package
            </Button>
          </div>
        }
      />

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
          value={catalogue.length}
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
            <Button variant="outline" onClick={closeModal} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={save} loading={saving}>
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
                      {catalogue.map((option) => (
                        <option
                          key={option.id}
                          value={option.id}
                          disabled={usedElsewhere.has(option.id)}
                        >
                          {option.name}
                          {option.variant ? ` · ${option.variant}` : ""}
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

      <Modal
        open={itemsModalOpen}
        onClose={() => setItemsModalOpen(false)}
        title="Package components"
        size="md"
        footer={
          <Button variant="outline" onClick={() => setItemsModalOpen(false)}>
            Done
          </Button>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-500">
            Components are the reusable items (e.g. Chador, Porda) you combine
            into packages.
          </p>
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_6rem_auto] items-end gap-2">
            <Input
              label="Name"
              value={itemForm.name}
              onChange={(e) =>
                setItemForm((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="e.g. Chador"
            />
            <Input
              label="Variant"
              value={itemForm.variant}
              onChange={(e) =>
                setItemForm((prev) => ({ ...prev, variant: e.target.value }))
              }
              placeholder="e.g. King size"
            />
            <Input
              label="Unit price"
              type="number"
              min="0"
              step="1"
              value={itemForm.unitPrice}
              onChange={(e) =>
                setItemForm((prev) => ({ ...prev, unitPrice: e.target.value }))
              }
            />
            <Button onClick={createComponent} loading={itemSaving}>
              Add
            </Button>
          </div>
          <div className="divide-y divide-slate-100 rounded-xl border border-slate-200">
            {catalogue.length === 0 && (
              <p className="p-3 text-sm text-slate-400">No components yet.</p>
            )}
            {catalogue.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 p-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800">
                    {item.name}
                    {item.variant ? (
                      <span className="text-slate-400"> · {item.variant}</span>
                    ) : null}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatCurrency(item.unitPrice)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeComponent(item)}
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                  aria-label={`Delete ${item.name}`}
                  title="Delete"
                >
                  <TrashIcon className="h-4.5 w-4.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}
