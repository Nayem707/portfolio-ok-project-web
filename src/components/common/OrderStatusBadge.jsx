import Badge from "@/components/common/Badge";
import { ORDER_STATUS, PAYMENT_STATUS } from "@/constants";

const orderColorMap = {
  [ORDER_STATUS.PENDING]: "yellow",
  [ORDER_STATUS.CONFIRMED]: "blue",
  [ORDER_STATUS.PROCESSING]: "indigo",
  [ORDER_STATUS.SHIPPED]: "purple",
  [ORDER_STATUS.DELIVERED]: "green",
  [ORDER_STATUS.CANCELLED]: "red",
};

const paymentColorMap = {
  [PAYMENT_STATUS.PAID]: "green",
  [PAYMENT_STATUS.UNPAID]: "yellow",
  [PAYMENT_STATUS.REFUNDED]: "gray",
};

export default function OrderStatusBadge({ status, type = "order" }) {
  const map = type === "payment" ? paymentColorMap : orderColorMap;
  return (
    <Badge color={map[status] || "gray"} dot>
      {status}
    </Badge>
  );
}
