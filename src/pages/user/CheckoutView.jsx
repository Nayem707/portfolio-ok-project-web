import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  BanknotesIcon,
  CreditCardIcon,
  LockClosedIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import Button from "@/components/common/Button";
import EmptyState from "@/components/common/EmptyState";
import Breadcrumb from "@/components/common/Breadcrumb";
import { selectCartItems, selectCartTotals, clearCart } from "@/features/cart";
import { placeOrder } from "@/features/orders";
import { selectCurrentUser } from "@/features/auth";
import { formatCurrency, getDiscountedPrice, classNames } from "@/utils";
import { PAYMENT_METHODS } from "@/constants";

const countries = [
  "United States",
  "Canada",
  "United Kingdom",
  "Australia",
  "Germany",
];

export default function CheckoutView() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector(selectCartItems);
  const { subtotal, shipping, total } = useSelector(selectCartTotals);
  const user = useSelector(selectCurrentUser);

  const [form, setForm] = useState({
    fullName: user?.name || "",
    phone: user?.phone || "",
    address: "",
    city: "",
    postalCode: "",
    country: "United States",
  });
  const [payment, setPayment] = useState(PAYMENT_METHODS.COD);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const savings = items.reduce(
    (sum, i) =>
      sum + (i.price - getDiscountedPrice(i.price, i.discount)) * i.quantity,
    0,
  );

  if (items.length === 0) {
    return (
      <div className="container-app py-8">
        <Breadcrumb items={[{ label: "Checkout" }]} />
        <div className="mt-8">
          <EmptyState
            title="Nothing to check out"
            description="Your cart is empty. Add some products first."
            action={
              <Button as={Link} to="/products">
                Browse products
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const validate = () => {
    const next = {};
    ["fullName", "phone", "address", "city", "postalCode"].forEach((field) => {
      if (!form[field]?.trim()) next[field] = "Required";
    });
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please complete the shipping information", {
        position: "bottom-right",
      });
      return;
    }
    setLoading(true);

    setTimeout(() => {
      const order = {
        customer: {
          id: user?.id || "guest",
          name: form.fullName,
          email: user?.email || "guest@shoply.com",
        },
        items: items.map((i) => ({
          id: i.id,
          name: i.name,
          price: i.price,
          discount: i.discount,
          quantity: i.quantity,
          image: i.image,
        })),
        shipping: form,
        paymentMethod: payment,
        subtotal,
        shippingCost: shipping,
        discount: +savings.toFixed(2),
        total,
      };
      const action = dispatch(placeOrder(order));
      dispatch(clearCart());
      setLoading(false);
      toast.success("Order placed successfully!", {
        position: "bottom-right",
      });
      navigate(`/account/orders/${action.payload.id}`, {
        state: { justPlaced: true },
      });
    }, 800);
  };

  return (
    <div className="container-app py-8">
      <Breadcrumb
        items={[{ label: "Cart", to: "/cart" }, { label: "Checkout" }]}
      />
      <h1 className="mt-6 text-2xl font-bold text-slate-900">Checkout</h1>

      <form
        onSubmit={handlePlaceOrder}
        className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]"
      >
        <div className="space-y-6">
          {/* Shipping */}
          <section className="card p-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Shipping Information
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Input
                label="Full name"
                value={form.fullName}
                onChange={set("fullName")}
                error={errors.fullName}
              />
              <Input
                label="Phone"
                value={form.phone}
                onChange={set("phone")}
                error={errors.phone}
              />
              <div className="sm:col-span-2">
                <Input
                  label="Address"
                  value={form.address}
                  onChange={set("address")}
                  error={errors.address}
                />
              </div>
              <Input
                label="City"
                value={form.city}
                onChange={set("city")}
                error={errors.city}
              />
              <Input
                label="Postal code"
                value={form.postalCode}
                onChange={set("postalCode")}
                error={errors.postalCode}
              />
              <div className="sm:col-span-2">
                <Select
                  label="Country"
                  value={form.country}
                  onChange={set("country")}
                >
                  {countries.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </Select>
              </div>
            </div>
          </section>

          {/* Payment */}
          <section className="card p-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Payment Method
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                {
                  value: PAYMENT_METHODS.COD,
                  icon: BanknotesIcon,
                  desc: "Pay when your order arrives",
                },
                {
                  value: PAYMENT_METHODS.ONLINE,
                  icon: CreditCardIcon,
                  desc: "Pay securely online now",
                },
              ].map((method) => (
                <button
                  type="button"
                  key={method.value}
                  onClick={() => setPayment(method.value)}
                  className={classNames(
                    "flex items-start gap-3 rounded-xl border-2 p-4 text-left transition",
                    payment === method.value
                      ? "border-primary-600 bg-primary-50/50"
                      : "border-slate-200 hover:border-slate-300",
                  )}
                >
                  <method.icon className="text-primary-600 h-6 w-6" />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {method.value}
                    </p>
                    <p className="text-xs text-slate-500">{method.desc}</p>
                  </div>
                </button>
              ))}
            </div>
            {payment === PAYMENT_METHODS.ONLINE && (
              <div className="mt-4 grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Input
                    label="Card number"
                    placeholder="4242 4242 4242 4242"
                    leftIcon={CreditCardIcon}
                  />
                </div>
                <Input label="Expiry" placeholder="MM / YY" />
                <Input label="CVC" placeholder="123" />
                <p className="text-xs text-slate-400 sm:col-span-2">
                  This is a demo — no real payment is processed.
                </p>
              </div>
            )}
          </section>
        </div>

        {/* Order summary */}
        <aside className="h-fit lg:sticky lg:top-32">
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Order Summary
            </h2>
            <div className="mt-4 max-h-64 space-y-3 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="relative shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-14 w-14 rounded-lg border border-slate-100 object-cover"
                    />
                    <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-white">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-sm font-medium text-slate-700">
                      {item.name}
                    </p>
                    <p className="text-sm font-semibold text-slate-900">
                      {formatCurrency(
                        getDiscountedPrice(item.price, item.discount) *
                          item.quantity,
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <dl className="mt-4 space-y-2.5 border-t border-slate-100 pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Subtotal</dt>
                <dd className="font-medium text-slate-800">
                  {formatCurrency(subtotal)}
                </dd>
              </div>
              {savings > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <dt>Discount</dt>
                  <dd className="font-medium">−{formatCurrency(savings)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-slate-500">Shipping</dt>
                <dd className="font-medium text-slate-800">
                  {shipping === 0 ? "Free" : formatCurrency(shipping)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-3">
                <dt className="text-base font-semibold text-slate-900">
                  Total
                </dt>
                <dd className="text-xl font-bold text-slate-900">
                  {formatCurrency(total)}
                </dd>
              </div>
            </dl>

            <Button
              type="submit"
              fullWidth
              size="lg"
              className="mt-5"
              loading={loading}
              leftIcon={CheckCircleIcon}
            >
              Place Order
            </Button>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-slate-400">
              <LockClosedIcon className="h-3.5 w-3.5" /> Secure & encrypted
              checkout
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
}
