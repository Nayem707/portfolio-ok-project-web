import { useState } from "react";
import { XCircleIcon } from "@heroicons/react/24/outline";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Modal from "@/components/common/Modal";
import { ORDER_STATUS } from "@/constants";
import { classNames, formatDate } from "@/utils";

const CANCELLABLE = [ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED];

/**
 * Cancellation status and action for a customer-facing order page.
 * `onCancel({ reason, code })` must resolve on success and reject with a message.
 */
export default function CancelOrderPanel({
  order,
  onCancel,
  requireCode = false,
  defaultCode = "",
  stacked = false,
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [code, setCode] = useState(defaultCode);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (order.status === ORDER_STATUS.CANCELLED) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm">
        <p className="flex items-center gap-2 font-semibold text-red-800">
          <XCircleIcon className="h-5 w-5" />
          Order cancelled
          {order.cancelledAt && ` on ${formatDate(order.cancelledAt)}`}
          {order.cancelledBy === "ADMIN" && " by the store"}
        </p>
        {order.cancelReason && (
          <p className="mt-1 text-red-700">Reason: {order.cancelReason}</p>
        )}
        {order.needsManualRefund && (
          <p className="mt-1 text-red-700">
            Your payment will be refunded manually. Our team will contact you.
          </p>
        )}
      </div>
    );
  }

  if (order.status === ORDER_STATUS.PROCESSING) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-600">
        This order is already being processed and can no longer be cancelled
        online. Please contact our support team if you need to cancel it.
      </div>
    );
  }

  if (!CANCELLABLE.includes(order.status)) return null;

  const close = () => {
    if (submitting) return;
    setOpen(false);
    setError("");
  };

  const submit = async (e) => {
    e.preventDefault();
    if (reason.trim().length < 3) {
      setError("Please tell us why you are cancelling");
      return;
    }
    if (requireCode && !code.trim()) {
      setError("Please enter your cancellation code");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await onCancel({ reason: reason.trim(), code: code.trim() });
      setOpen(false);
      setReason("");
    } catch (err) {
      setError(err || "Failed to cancel order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div
        className={classNames(
          "flex flex-col gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4 text-sm",
          !stacked && "sm:flex-row sm:items-center sm:justify-between",
        )}
      >
        <p className="text-slate-600">
          Changed your mind? You can cancel this order until it is processed.
        </p>
        <Button
          variant="danger"
          onClick={() => setOpen(true)}
          className="shrink-0"
          fullWidth={stacked}
        >
          Cancel order
        </Button>
      </div>

      <Modal
        open={open}
        onClose={close}
        title={`Cancel order ${order.orderNumber}`}
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={close} disabled={submitting}>
              Keep order
            </Button>
            <Button
              variant="danger"
              type="submit"
              form="cancel-order-form"
              loading={submitting}
            >
              Cancel order
            </Button>
          </>
        }
      >
        <form
          id="cancel-order-form"
          onSubmit={submit}
          noValidate
          className="space-y-4"
        >
          <div>
            <label
              htmlFor="cancel-reason"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Reason for cancelling
            </label>
            <textarea
              id="cancel-reason"
              rows={3}
              maxLength={500}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Ordered by mistake, found a better price…"
              className="input-base"
            />
          </div>
          {requireCode && (
            <Input
              label="Cancellation code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="XXXXX-XXXXX"
              hint="Shown when you placed the order."
              autoComplete="off"
            />
          )}
          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
        </form>
      </Modal>
    </>
  );
}
