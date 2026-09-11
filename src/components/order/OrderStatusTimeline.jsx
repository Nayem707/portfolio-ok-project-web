import { CheckIcon } from "@heroicons/react/24/solid";
import { ORDER_STATUS, ORDER_STATUS_FLOW } from "@/constants";
import { classNames } from "@/utils";

export default function OrderStatusTimeline({ status }) {
  if (status === ORDER_STATUS.CANCELLED) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600">
          ✕
        </span>
        <div>
          <p className="text-sm font-semibold text-red-700">Order Cancelled</p>
          <p className="text-xs text-red-500">This order was cancelled.</p>
        </div>
      </div>
    );
  }

  const currentIndex = ORDER_STATUS_FLOW.indexOf(status);

  return (
    <ol className="relative flex flex-col gap-0 sm:flex-row sm:justify-between sm:gap-2">
      {ORDER_STATUS_FLOW.map((step, idx) => {
        const done = idx <= currentIndex;
        const active = idx === currentIndex;
        return (
          <li
            key={step}
            className="relative flex flex-1 items-center gap-3 pb-6 sm:flex-col sm:pb-0 sm:text-center"
          >
            {/* connector */}
            {idx < ORDER_STATUS_FLOW.length - 1 && (
              <span
                className={classNames(
                  "absolute top-8 left-4 h-full w-0.5 sm:top-4 sm:left-[calc(50%+1rem)] sm:h-0.5 sm:w-[calc(100%-2rem)]",
                  idx < currentIndex ? "bg-primary-600" : "bg-slate-200",
                )}
              />
            )}
            <span
              className={classNames(
                "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold transition sm:mx-auto",
                done
                  ? "border-primary-600 bg-primary-600 text-white"
                  : "border-slate-300 bg-white text-slate-400",
                active && "ring-primary-100 ring-4",
              )}
            >
              {done ? <CheckIcon className="h-4 w-4" /> : idx + 1}
            </span>
            <span
              className={classNames(
                "text-sm font-medium sm:mt-2",
                done ? "text-slate-800" : "text-slate-400",
              )}
            >
              {step}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
