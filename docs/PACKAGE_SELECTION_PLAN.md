# Package Selection on Product Pages — Implementation Plan

Goal: let a customer pick a **package** on the product page (for example
"শুধু চাদর সেট ৳1,600", "চাদর + ২ পিস পর্দা ৳2,600", "চাদর + ৪ পিস পর্দা ৳3,600")
and have the **price, cart, checkout and order** all follow the chosen package.

This document is based on the current code as of 2 Oct 2026. Nothing here has
been implemented yet.

---

## 1. Summary

| Question                            | Recommendation                                                                                                                          |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Where are packages defined?         | Global **package templates** in Admin → Attributes → Packages (the screen that already exists with sample data), like Colors and Sizes. |
| Where is the price set?             | **Per product.** Each product picks which packages it offers and sets its own price for each one.                                       |
| How does the product discount work? | The product's existing `discount` % applies to the package price, exactly as it does to `product.price` today.                          |
| Stock                               | One package sold = one unit of `product.stock` (no per-package stock in phase 1).                                                       |
| Who decides the final price?        | The **server**, at checkout, from the package price in the database. The browser price is display only.                                 |
| Products without packages           | Behave exactly as today. Packages are optional.                                                                                         |

---

## 2. What exists today (analysis)

### Database (`server/prisma/schema.prisma`)

- `Product` has one `price` (BDT), a `discount` % and one `stock` number.
- Variants are only **Color** and **Size**: global tables (`Color`, `Size`)
  plus join tables (`ProductColor`, `ProductSize`). They carry **no price**.
- `CartItem` and `OrderItem` store `selectedColor` / `selectedSize` as text.
  `OrderItem` also snapshots `productName`, `unitPrice` and `subtotal`.
- There is **no package or price-variant concept** anywhere.

### Backend

- `orders.service.ts → checkout()` recalculates every line on the server:
  `unitPrice = product.price × (1 − discount/100)`, validates color/size against
  the product, decrements `product.stock`, snapshots the line into `OrderItem`.
  This is the right place to enforce package prices.
- `cart.service.ts` (server cart) exists but the storefront uses a **local
  cart** (see below). It still needs the same change so it stays consistent.
- `products.service.ts` filters and sorts by `product.price`
  (`minPrice` / `maxPrice`, `price-asc` / `price-desc`).

### Frontend

- **Cart is browser-only** (`features/cart/cart.slice.js`, saved to
  localStorage). A line is identified by
  `resolveItemKey(productId, color, size)` and priced from
  `item.price` + `item.discount` (`cart.utils.js`).
- **Checkout** (`features/orders/orders.slice.js`) sends
  `{ productId, quantity, selectedColor, selectedSize }` per line.
- **Product page** (`pages/public/ProductDetailsView.jsx`) shows color and size
  buttons, `PriceDisplay`, `QuantitySelector`, Add to Cart / Buy Now, and the
  WhatsApp order link.
- **Quick add** from product cards uses `useAddProductToCart` +
  `AddToCartVariantModal`, which asks for missing color/size.
- **Admin → Attributes → Packages** (`pages/admin/AdminPackageListView.jsx`)
  already has the full create/edit/delete/active UI, running on sample data
  from `features/packages/packages.mock.js`.

### Conclusion

Packages behave like a **third variant type that also changes the price**. The
cleanest fit is to copy the Color/Size pattern (global attribute + per-product
join table) and add a price to the join table.

---

## 3. Data model

### New tables

```prisma
/// Global package template managed in Admin → Attributes → Packages.
model Package {
  id          String        @id @default(cuid())
  name        String        @unique          // "Chador + 2 Pieces Porda"
  title       String?                        // customer label, e.g. "চাদর + ২ পিস পর্দা কম্বো"
  description String?
  icon        String?                        // optional emoji / icon key
  status      PackageStatus @default(ACTIVE)
  sortOrder   Int           @default(0)
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  components PackageComponent[]
  products   ProductPackage[]
}

/// What a package contains ("Porda × 2"). Informational, shown to customers.
model PackageComponent {
  id        String  @id @default(cuid())
  packageId String
  package   Package @relation(fields: [packageId], references: [id], onDelete: Cascade)
  name      String                           // "Porda (Curtain)"
  quantity  Int     @default(1)
  sortOrder Int     @default(0)

  @@index([packageId])
}

/// A package offered on a specific product, with that product's price.
model ProductPackage {
  id        String   @id @default(cuid())
  productId String
  packageId String
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  package   Package  @relation(fields: [packageId], references: [id], onDelete: Restrict)
  price     Decimal  @db.Decimal(10, 2)       // BDT, before product discount
  isDefault Boolean  @default(false)
  active    Boolean  @default(true)
  sortOrder Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([productId, packageId])
  @@index([packageId])
}

enum PackageStatus {
  ACTIVE
  INACTIVE
}
```

`onDelete: Restrict` on `ProductPackage.package` stops an admin deleting a
package template that products still use. The admin UI should show
"Used by N products" and offer **Set inactive** instead.

### Changes to existing tables

```prisma
model Product {
  // ...
  packages ProductPackage[]
}

model CartItem {
  // ...
  selectedPackageId String?
  @@unique([cartId, productId, selectedColor, selectedSize, selectedPackageId])
}

model OrderItem {
  // ...
  packageId   String?   // reference, may point to a deleted/renamed package later
  packageName String?   // snapshot shown on invoices and order history
}
```

`OrderItem.packageName` is a **snapshot** (like `productName`) so old orders
keep showing what was bought even if the package is renamed or removed.

### Keeping `product.price` meaningful

Listing filters and sorting use `product.price`. When a product has active
packages, the server should set **`product.price` = lowest active package
price** whenever the product's packages are saved. Then "Max price",
"Price: Low to High" and product cards ("From ৳1,600") keep working with no
query changes.

### Migration (important for this project)

- The project's Prisma migration history is out of sync, so `prisma migrate dev`
  fails. As before, write an idempotent SQL file under
  `server/prisma/migrations/<timestamp>_add_packages/migration.sql`
  (`CREATE TABLE IF NOT EXISTS …`, `ADD COLUMN IF NOT EXISTS …`) and apply it
  with `npx prisma db execute --file … --schema prisma/schema.prisma`.
- `DATABASE_URL` points at the **live production database**, so the migration
  must be approved before it is run.
- After applying: stop the API dev process, run `npx prisma generate`, restart.

---

## 4. Backend work

### 4.1 Packages module (new) — `server/src/modules/packages/`

Same structure as the other modules (`routes`, `controller`, `service`,
`validation`).

| Method & path                 | Access | Purpose                                                         |
| ----------------------------- | ------ | --------------------------------------------------------------- |
| `GET /api/v1/packages`        | Admin  | List templates with components and "used by N products".        |
| `POST /api/v1/packages`       | Admin  | Create template with components.                                |
| `PATCH /api/v1/packages/:id`  | Admin  | Update name, title, components, status, sort order.             |
| `DELETE /api/v1/packages/:id` | Admin  | Delete only if unused; otherwise 409 "Set it inactive instead". |

Validation (zod): name 2–120 chars and unique; components 1–20 with name and
quantity 1–99.

### 4.2 Products module

- **Create/update product** accepts an optional list:

  ```ts
  packages?: Array<{
    packageId: string;
    price: number;       // > 0, BDT
    isDefault?: boolean;
    active?: boolean;
    sortOrder?: number;
  }>;
  ```

  In one transaction: replace the product's `ProductPackage` rows, make sure at
  most one `isDefault` (fallback: first active by `sortOrder`), then set
  `product.price` to the lowest active package price (rule in section 3).

- **Product responses** (`shape()` in `products.service.ts`) add:

  ```ts
  packages: [{
    id,            // ProductPackage id (the selectable option)
    packageId,
    name, title, description, icon,
    components: [{ name, quantity }],
    price,         // before discount
    finalPrice,    // after product discount
    isDefault,
  }],
  hasPackages: boolean,
  ```

  Only active packages whose template is also `ACTIVE`, ordered by `sortOrder`.
  The admin product endpoint returns inactive ones too so they can be edited.

### 4.3 Checkout (`orders.service.ts`)

1. Accept `selectedPackageId?: string` per item (`orders.validation.ts`).
2. Load products with `packages: { include: { package: true } }`.
3. For each line:
   - If the product **has active packages**, `selectedPackageId` is required and
     must belong to this product, be active, and have an active template.
     Otherwise reject: `Package is required for <product>` /
     `Invalid package for <product>`.
   - If the product has **no** packages, ignore any `selectedPackageId`.
   - `basePrice = productPackage.price` (package) or `product.price` (no package).
   - `unitPrice = round(basePrice × (1 − product.discount / 100))` (unchanged).
4. Snapshot into `OrderItem`: `packageId`, `packageName` (template `title`, or
   `name` if there is no title).
5. Stock: unchanged, decrement `product.stock` by the quantity.

### 4.4 Server cart (`cart.service.ts`, `cart.validation.ts`)

Not used by the storefront today, but keep it consistent: accept
`selectedPackageId`, include it in the "same line" lookup, and price lines from
the package. This prevents a future switch to the server cart from mispricing.

### 4.5 Order responses

Include `packageName` in order items everywhere they are returned (admin order
details, customer orders, phone order tracking).

---

## 5. Admin UI

### 5.1 Attributes → Packages (already built)

- Replace `MOCK_PACKAGES` with a real data source. Following the project
  pattern this is a Redux slice: `features/packages/{packages.slice.js,
packages.selectors.js, index.js}` with `fetchPackages`, `createPackage`,
  `updatePackage`, `deletePackage`, and `api.js` methods.
- The template no longer stores a price (price is per product). Change the
  form:
  - **Components:** keep the item rows (name + quantity). The mock "available
    items" list becomes free-text component names, because components are only
    descriptive.
  - **Price section:** remove it, or keep an optional "suggested price" that
    pre-fills the product form.
  - **Customer title** (Bangla) and an optional **icon**.
- Table: replace the Price column with **Used by N products**. Delete shows the
  409 message when the package is in use.
- Remove the "Preview mode" notice and delete `packages.mock.js`.
- The Attributes card count becomes the real `packages.length`.

### 5.2 Product form (`components/admin/ProductForm.jsx`)

Add a **Packages** card below Price/Stock:

- "Sell this product as packages" switch.
- When on: a table of rows → **Package** (select from active templates, no
  duplicates), **Price (BDT)**, **Default** (radio), **Active** (switch),
  move up/down, remove; plus an "Add package" button.
- The main "Price (BDT)" field becomes read-only with the hint "Set
  automatically to the lowest package price". The server stays the source of
  truth (section 3).
- Validation: at least one active package when the switch is on; price > 0.
- Submit adds `packages: [...]` to the payload. Turning the switch off sends
  `packages: []`.

### 5.3 Orders

`AdminOrderDetailsView.jsx`: show `packageName` under the product name next to
color/size, for example "চাদর + ২ পিস পর্দা কম্বো · Blue · King".

---

## 6. Storefront UI

### 6.1 Product page (`ProductDetailsView.jsx`)

New state: `selectedPackageId`, initialised when the product loads to the
`isDefault` package, or else the first one. Optional: read/write
`?package=<id>` in the URL so a link (for example from WhatsApp) opens with that
package selected.

**Package selector** (as in the screenshot), placed above Color/Size:

- Heading: "সাইজ / প্যাকেজ সিলেক্ট করুন".
- Responsive grid of selectable cards (`grid-cols-1 sm:grid-cols-3`). Each card
  shows the icon, title and final price pill, with a check badge on the
  selected one. Selected style: `border-primary-600 bg-primary-50` (brand
  colors). Use `role="radiogroup"` / `role="radio"` + `aria-checked` and arrow
  key navigation.
- Optional component line under the selected card:
  "চাদর ×1 · পর্দা ×2".

**Price follows the selection:**

```js
const selectedPackage = product.packages?.find((p) => p.id === selectedPackageId);
const basePrice = selectedPackage ? selectedPackage.price : product.price;
// PriceDisplay already applies product.discount → pass basePrice
<PriceDisplay price={basePrice} discount={product.discount} ... />
```

- Show "মোট: ৳{finalPrice × quantity}" next to the quantity selector (as in the
  screenshot).
- **Add to Cart / Buy Now** pass `selectedPackageId`, `packageName` and
  `price: basePrice` along with color/size.
- The toast and WhatsApp message include the package name, for example
  "Hi! I want: 3D Premium Kuchi Chador — চাদর + ২ পিস পর্দা কম্বো (৳2,600) …".
- If `product.hasPackages` is true but none is selected (should not happen
  because of the default), block add-to-cart with "Please select a package".

### 6.2 Cart (`features/cart/`)

- `resolveItemKey(productId, color, size, packageId)`: the package becomes part
  of the line identity, so "Only Chador" and "Chador + 2 Porda" are separate
  lines.
- `buildCartItem`: store `selectedPackageId`, `packageName`, and
  `price = package price` (so `getDiscountedPrice(item.price, item.discount)`
  keeps working unchanged).
- `getMissingVariantLabels`: add `"package"` when `product.hasPackages` and no
  package is selected. This automatically makes quick-add open
  `AddToCartVariantModal`.
- `matchesCartItem` / `normaliseSelector`: include the package.
- **Old carts in localStorage** have no package fields. Treat
  `selectedPackageId: undefined` as `null`, so they keep working for products
  without packages. For products that now require a package, checkout returns
  "Package is required"; the cart page should show a "Choose package" select on
  those lines (same pattern as the existing color/size editing via
  `updateCartItemOptions`, extended with `selectedPackageId`).

### 6.3 Quick add (`AddToCartVariantModal.jsx`, `useAddProductToCart.js`)

Add the same package cards (compact) to the modal, and show the live price
while choosing.

### 6.4 Product cards and listings (`ProductCard.jsx`)

When `hasPackages`: show "From ৳{lowest final price}" (this is `product.price`
after the server rule) and always open the variant modal on "Add to cart".

### 6.5 Checkout and order history

- `orders.slice.js` → `placeOrder`: send `selectedPackageId` per item.
  `normalizeOrder`: map `packageName`.
- Show the package name on: `CartView`, `MiniCart`, the checkout summary,
  customer order details, and `TrackOrderView`.

---

## 7. Suggested delivery phases

| Phase | Scope                                                                            | Notes                                                                       |
| ----- | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| 1     | DB tables + migration, packages module, product create/update + response         | Needs approval to run the migration on the live DB.                         |
| 2     | Admin Packages page on real API; product form Packages card                      | Admins can set up packages; storefront unchanged.                           |
| 3     | Product page selector + live price + cart changes                                | Customers can choose packages.                                              |
| 4     | Checkout validation + `OrderItem` snapshot; order screens show package           | Ship 3 and 4 **together**, or carts would hold packages the server ignores. |
| 5     | Product cards "From" price, quick-add modal, cart "Choose package" for old carts | Polish.                                                                     |

Phases 3 and 4 must go live in the same release.

---

## 8. Edge cases to handle

- **Package removed or set inactive while it sits in a cart:** checkout
  rejects that line with a clear message. The cart page asks the customer to
  choose another package.
- **Price changed after adding to cart:** the server always charges the current
  price. The cart shows the stored price, so refresh cart prices when the cart
  page opens (fetch the products, or have the checkout response report price
  changes).
- **Product discount + package:** the discount applies to every package
  equally. If per-package discounts are needed later, add `compareAtPrice` to
  `ProductPackage` instead of changing the discount logic.
- **Stock:** shared across packages. If "Chador + 4 Porda" should consume more
  stock, add per-package stock later (`ProductPackage.stock`).
- **Old orders:** have no package. Screens must handle `packageName = null`.
- **Currency:** package prices are BDT like products. `formatCurrency` already
  converts for display.
- **SEO / sharing:** the optional `?package=` URL param keeps shared links
  accurate.

---

## 9. Test checklist

- Product with no packages: page, cart and checkout work exactly as before.
- Product with 3 packages: the default is preselected; switching updates the
  price, total and WhatsApp text; Add to Cart creates separate lines per package.
- Discount 20% on a ৳3,200 package: shows ৳3,200 struck through and ৳2,560;
  the order stores `unitPrice` 2560.
- Tampered request (wrong `selectedPackageId`, or a lower price sent by the
  browser): the server rejects it or charges the database price.
- Package set inactive after it was added to a cart: checkout shows the error,
  and the cart lets the customer pick another package.
- Admin: deleting a package used by a product is blocked; setting it inactive
  hides it on the storefront.
- Listing: "Max price" and price sorting use the lowest package price.
- Mobile (375px): package cards stack and nothing scrolls sideways.

---

## 10. Decisions needed before starting

1. **Per-product prices** (recommended) or one fixed price per package for all
   products?
2. Should the **product discount %** apply to package prices (recommended), or
   should each package have its own sale price?
3. **Stock:** shared per product (recommended for phase 1) or per package?
4. Are package names shown to customers in **Bangla** (customer title), with
   English names for admins, like categories?
5. Approval to run the database migration on the **live database**.
