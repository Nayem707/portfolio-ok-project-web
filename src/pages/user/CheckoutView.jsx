import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  BanknotesIcon,
  BoltIcon,
  BuildingOffice2Icon,
  CheckCircleIcon,
  CheckIcon,
  CreditCardIcon,
  HomeIcon,
  LockClosedIcon,
  MapPinIcon,
  PhoneIcon,
  ShieldCheckIcon,
  TruckIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import EmptyState from "@/components/common/EmptyState";
import Breadcrumb from "@/components/common/Breadcrumb";
import {
  selectCartItems,
  selectCartTotals,
  selectDeliveryRates,
} from "@/features/cart";
import { placeOrder } from "@/features/orders";
import { selectCurrentUser } from "@/features/auth";
import {
  formatCurrency,
  getDiscountedPrice,
  classNames,
  resolveMediaUrl,
} from "@/utils";
import { DELIVERY_AREAS, PAYMENT_METHODS } from "@/constants";
import {
  BD_DISTRICTS,
  DHAKA_DISTRICT,
  getThanas,
} from "@/constants/bdLocations";

const BD_MOBILE_PATTERN = /^01[3-9]\d{8}$/;

const SELECT_CHEVRON = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='2' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5'/%3E%3C/svg%3E\")",
};

const fieldControlClass = (error) =>
  classNames(
    "w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-800 transition outline-none placeholder:text-slate-400 focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400",
    error
      ? "border-red-300 focus:border-red-400 focus:ring-red-100"
      : "border-primary-100 focus:border-primary-400 focus:ring-primary-100",
  );

const selectControlClass = (error) =>
  classNames(
    fieldControlClass(error),
    "cursor-pointer appearance-none bg-[length:1.25rem] bg-[right_0.5rem_center] bg-no-repeat pr-9",
  );

const toLocalMobile = (phone = "") => {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("880") ? digits.slice(2) : digits;
};

function IconField({ icon: Icon, error, children }) {
  return (
    <div>
      <div
        className={classNames(
          "flex items-start gap-2 rounded-xl border bg-slate-50/60 p-1.5",
          error ? "border-red-200" : "border-slate-200",
        )}
      >
        <span className="bg-primary-50 text-primary-600 ring-primary-100 flex h-10.5 w-10.5 shrink-0 items-center justify-center rounded-lg ring-1">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
      {error && <p className="mt-1 px-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function SectionHeader({ icon: Icon, title, badgeIcon: BadgeIcon, badge }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
        <Icon className="text-primary-600 h-5 w-5" />
        {title}
      </h2>
      <span className="bg-primary-50 text-primary-700 ring-primary-100 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1">
        <BadgeIcon className="h-3.5 w-3.5" />
        {badge}
      </span>
    </div>
  );
}

const PAYMENT_OPTIONS = [
  {
    value: "COD",
    label: PAYMENT_METHODS.COD,
    icon: BanknotesIcon,
    desc: "Pay with cash when you receive your order (no advance payment).",
  },
  {
    value: "ONLINE",
    label: PAYMENT_METHODS.ONLINE,
    icon: CreditCardIcon,
    desc: "Pay securely online now.",
  },
];

const DELIVERY_OPTIONS = [
  { value: DELIVERY_AREAS.OUTSIDE_DHAKA, label: "Outside Dhaka" },
  { value: DELIVERY_AREAS.INSIDE_DHAKA, label: "Inside Dhaka" },
];

export default function CheckoutView() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector(selectCartItems);
  const { subtotal } = useSelector(selectCartTotals);
  const deliveryRates = useSelector(selectDeliveryRates);
  const user = useSelector(selectCurrentUser);

  const [form, setForm] = useState({
    fullName: user?.name || "",
    phone: toLocalMobile(user?.phone),
    district: "",
    thana: "",
    address: "",
  });
  const [deliveryArea, setDeliveryArea] = useState(
    DELIVERY_AREAS.OUTSIDE_DHAKA,
  );
  const [payment, setPayment] = useState("COD");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const shipping = deliveryRates[deliveryArea] ?? 0;
  const total = subtotal + shipping;
  const savings = items.reduce(
    (sum, i) =>
      sum + (i.price - getDiscountedPrice(i.price, i.discount)) * i.quantity,
    0,
  );

  if (items.length === 0) {
    return (
      <div className="container-app py-8">
        <div className="mx-auto w-full max-w-7xl">
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
      </div>
    );
  }

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const set = (key) => (e) => updateField(key, e.target.value);

  const handlePhoneChange = (e) =>
    updateField("phone", e.target.value.replace(/\D/g, "").slice(0, 11));

  const handleDistrictChange = (e) => {
    const district = e.target.value;
    setForm((prev) => ({ ...prev, district, thana: "" }));
    setErrors((prev) => ({ ...prev, district: undefined, thana: undefined }));
    if (district) {
      setDeliveryArea(
        district === DHAKA_DISTRICT
          ? DELIVERY_AREAS.INSIDE_DHAKA
          : DELIVERY_AREAS.OUTSIDE_DHAKA,
      );
    }
  };

  const validate = () => {
    const next = {};
    if (!form.fullName.trim()) next.fullName = "Please enter your full name";
    if (!BD_MOBILE_PATTERN.test(form.phone))
      next.phone = "Enter a valid 11-digit mobile number";
    if (!form.district) next.district = "Please select a district";
    if (!form.thana) next.thana = "Please select a thana / upazila";
    if (!form.address.trim()) next.address = "Please enter your full address";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please complete the shipping information", {
        position: "bottom-right",
      });
      return;
    }
    setLoading(true);

    try {
      const order = await dispatch(
        placeOrder({
          paymentMethod: payment,
          shipping: {
            fullName: form.fullName.trim(),
            phone: form.phone,
            country: "Bangladesh",
            city: `${form.thana}, ${form.district}`,
            street: form.address.trim(),
            deliveryArea,
          },
        }),
      ).unwrap();
      toast.success(`Order ${order.orderNumber} placed successfully!`, {
        position: "bottom-right",
      });
      navigate(`/account/orders/${order.id}`, {
        state: { justPlaced: true },
      });
    } catch (error) {
      toast.error(error || "Failed to place order", {
        position: "bottom-right",
      });
    } finally {
      setLoading(false);
    }
  };

  const thanas = getThanas(form.district);

  return (
    <div className="container-app py-8">
      <div className="mx-auto w-full max-w-7xl">
        <Breadcrumb
          items={[{ label: "Cart", to: "/cart" }, { label: "Checkout" }]}
        />
        <h1 className="mt-6 text-2xl font-bold text-slate-900">Checkout</h1>

        <form
          onSubmit={handlePlaceOrder}
          noValidate
          className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]"
        >
          <div className="space-y-6">
            {/* Shipping */}
            <section className="card p-5 sm:p-6">
              <SectionHeader
                icon={MapPinIcon}
                title="Shipping Information"
                badgeIcon={BoltIcon}
                badge="Fast delivery"
              />
              <div className="mt-5 space-y-3">
                <IconField icon={UserIcon} error={errors.fullName}>
                  <input
                    type="text"
                    aria-label="Full name"
                    placeholder="Enter your full name"
                    autoComplete="name"
                    value={form.fullName}
                    onChange={set("fullName")}
                    aria-invalid={!!errors.fullName}
                    className={fieldControlClass(errors.fullName)}
                  />
                </IconField>

                <IconField icon={PhoneIcon} error={errors.phone}>
                  <input
                    type="tel"
                    inputMode="numeric"
                    aria-label="Mobile number"
                    placeholder="11-digit mobile number (01XXXXXXXXX)"
                    autoComplete="tel"
                    value={form.phone}
                    onChange={handlePhoneChange}
                    aria-invalid={!!errors.phone}
                    className={fieldControlClass(errors.phone)}
                  />
                </IconField>

                <div className="grid gap-3 sm:grid-cols-2">
                  <IconField icon={BuildingOffice2Icon} error={errors.district}>
                    <select
                      aria-label="District"
                      value={form.district}
                      onChange={handleDistrictChange}
                      aria-invalid={!!errors.district}
                      className={selectControlClass(errors.district)}
                      style={SELECT_CHEVRON}
                    >
                      <option value="">-- Select district --</option>
                      {BD_DISTRICTS.map((district) => (
                        <option key={district} value={district}>
                          {district}
                        </option>
                      ))}
                    </select>
                  </IconField>

                  <IconField icon={MapPinIcon} error={errors.thana}>
                    <select
                      aria-label="Thana / Upazila"
                      value={form.thana}
                      onChange={set("thana")}
                      disabled={!form.district}
                      aria-invalid={!!errors.thana}
                      className={selectControlClass(errors.thana)}
                      style={SELECT_CHEVRON}
                    >
                      <option value="">-- Thana / Upazila --</option>
                      {thanas.map((thana) => (
                        <option key={thana} value={thana}>
                          {thana}
                        </option>
                      ))}
                    </select>
                  </IconField>
                </div>

                <IconField icon={HomeIcon} error={errors.address}>
                  <textarea
                    rows={3}
                    aria-label="Full address"
                    placeholder="Full address (house no., road, area / village)"
                    autoComplete="street-address"
                    value={form.address}
                    onChange={set("address")}
                    aria-invalid={!!errors.address}
                    className={classNames(
                      fieldControlClass(errors.address),
                      "resize-y",
                    )}
                  />
                </IconField>
              </div>
            </section>

            {/* Payment + delivery area */}
            <section className="card p-5 sm:p-6">
              <SectionHeader
                icon={CreditCardIcon}
                title="Payment Method"
                badgeIcon={ShieldCheckIcon}
                badge="100% Secure"
              />

              <div className="mt-5 space-y-3">
                {PAYMENT_OPTIONS.map((method) => {
                  const selected = payment === method.value;
                  return (
                    <button
                      type="button"
                      key={method.value}
                      onClick={() => setPayment(method.value)}
                      aria-pressed={selected}
                      className={classNames(
                        "relative flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition",
                        selected
                          ? "border-primary-600 bg-primary-50/60"
                          : "border-slate-200 bg-white hover:border-slate-300",
                      )}
                    >
                      <span
                        className={classNames(
                          "flex h-12 w-14 shrink-0 items-center justify-center rounded-lg ring-1",
                          selected
                            ? "text-primary-600 ring-primary-200 bg-white"
                            : "bg-slate-50 text-slate-500 ring-slate-200",
                        )}
                      >
                        <method.icon className="h-7 w-7" />
                      </span>
                      <span className="min-w-0 pr-6">
                        <span
                          className={classNames(
                            "block text-sm font-semibold",
                            selected ? "text-primary-700" : "text-slate-800",
                          )}
                        >
                          {method.label}
                        </span>
                        <span className="mt-0.5 block text-xs text-slate-500">
                          {method.desc}
                        </span>
                      </span>
                      {selected && (
                        <CheckIcon className="text-primary-600 absolute top-3 right-3 h-5 w-5" />
                      )}
                    </button>
                  );
                })}
              </div>

              {payment === "ONLINE" && (
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
                    Online payment UI is preview-only in frontend; backend still
                    records payment method correctly.
                  </p>
                </div>
              )}

              <fieldset className="mt-6">
                <legend className="flex items-center gap-2 text-base font-semibold text-slate-900">
                  <TruckIcon className="text-primary-600 h-5 w-5" />
                  Select delivery area:
                </legend>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {DELIVERY_OPTIONS.map((option) => {
                    const selected = deliveryArea === option.value;
                    return (
                      <label
                        key={option.value}
                        className={classNames(
                          "flex cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3 transition",
                          selected
                            ? "border-primary-600 bg-primary-50/60"
                            : "border-slate-200 bg-white hover:border-slate-300",
                        )}
                      >
                        <input
                          type="radio"
                          name="deliveryArea"
                          value={option.value}
                          checked={selected}
                          onChange={() => setDeliveryArea(option.value)}
                          className="sr-only"
                        />
                        <span
                          aria-hidden="true"
                          className={classNames(
                            "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                            selected
                              ? "border-primary-600"
                              : "border-slate-300",
                          )}
                        >
                          {selected && (
                            <span className="bg-primary-600 h-2.5 w-2.5 rounded-full" />
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span
                            className={classNames(
                              "block text-sm font-semibold",
                              selected ? "text-primary-700" : "text-slate-800",
                            )}
                          >
                            {option.label}
                          </span>
                          <span className="block text-xs text-slate-500">
                            Delivery charge
                          </span>
                        </span>
                        <span
                          className={classNames(
                            "rounded-full px-3 py-1 text-sm font-bold",
                            selected
                              ? "bg-primary-600 text-white"
                              : "bg-slate-100 text-slate-700",
                          )}
                        >
                          {formatCurrency(deliveryRates[option.value] ?? 0)}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
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
                  <div
                    key={item.itemKey || item.cartItemId || item.id}
                    className="flex gap-3"
                  >
                    <div className="relative shrink-0">
                      <img
                        src={resolveMediaUrl(item.image)}
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
                  <dt className="text-slate-500">
                    Delivery charge
                    <span className="block text-xs text-slate-400">
                      {deliveryArea === DELIVERY_AREAS.INSIDE_DHAKA
                        ? "Inside Dhaka"
                        : "Outside Dhaka"}
                    </span>
                  </dt>
                  <dd className="font-medium text-slate-800">
                    {formatCurrency(shipping)}
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
    </div>
  );
}
