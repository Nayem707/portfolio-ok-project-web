import { getDiscountedPrice, formatCurrency } from "@/utils";
import { classNames } from "@/utils";

export default function PriceDisplay({
  price,
  discount = 0,
  size = "md",
  className,
}) {
  const final = getDiscountedPrice(price, discount);
  const hasDiscount = discount > 0;
  const sizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl",
    xl: "text-2xl",
  };
  return (
    <div className={classNames("flex items-baseline gap-1", className)}>
      <span className={classNames("font-bold text-slate-900", sizes[size])}>
        {formatCurrency(final)}
      </span>
      {hasDiscount && (
        <span className="text-xs font-medium text-slate-400 line-through">
          {formatCurrency(price)}
        </span>
      )}
    </div>
  );
}
