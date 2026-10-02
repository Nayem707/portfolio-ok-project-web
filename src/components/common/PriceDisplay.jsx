import { useSelector } from "react-redux";
import { getDiscountedPrice, formatCurrency, classNames } from "@/utils";
import { selectCurrency, selectBdtPerUsd } from "@/features/settings";

export default function PriceDisplay({
  price,
  discount = 0,
  size = "md",
  className,
  amountClassName = "text-slate-900",
  hideDecimals = false,
  baseCurrency = "BDT",
}) {
  const currency = useSelector(selectCurrency);
  const bdtPerUsd = useSelector(selectBdtPerUsd);
  const final = getDiscountedPrice(price, discount);
  const hasDiscount = discount > 0;

  const formatValue = (value) =>
    formatCurrency(value, {
      from: baseCurrency,
      currency,
      bdtPerUsd,
    });

  const displayedFinal = formatValue(hideDecimals ? Math.trunc(final) : final);
  const displayedOriginal = formatValue(hideDecimals ? Math.trunc(price) : price);

  const sizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl",
    xl: "text-2xl",
  };
  return (
    <div className={classNames("flex items-baseline gap-1", className)}>
      <span className={classNames("font-bold", amountClassName, sizes[size])}>
        {displayedFinal}
      </span>
      {hasDiscount && (
        <span className="text-xs font-medium text-slate-400 line-through">
          {displayedOriginal}
        </span>
      )}
    </div>
  );
}
