/**
 * Sample data for the Packages UI. There is no packages API yet, so the admin
 * screen works on a local copy of these lists. Prices are in BDT, like products.
 */

export const MOCK_PACKAGE_ITEMS = [
  {
    id: "item-chador",
    name: "Chador (Bedsheet)",
    variant: "King size, cotton",
    unitPrice: 1200,
  },
  {
    id: "item-porda",
    name: "Porda (Curtain)",
    variant: "Per piece, 7 ft",
    unitPrice: 450,
  },
  {
    id: "item-pillow-cover",
    name: "Pillow Cover",
    variant: "Standard, cotton",
    unitPrice: 150,
  },
  {
    id: "item-cushion-cover",
    name: "Cushion Cover",
    variant: "16 × 16 in",
    unitPrice: 180,
  },
  {
    id: "item-comforter",
    name: "Comforter",
    variant: "King size, all-season",
    unitPrice: 2500,
  },
  {
    id: "item-mattress-protector",
    name: "Waterproof Mattress Protector",
    variant: "King size",
    unitPrice: 900,
  },
];

export const MOCK_PACKAGES = [
  {
    id: "pkg-only-chador",
    name: "Only Chador",
    description: "A single king-size cotton chador.",
    items: [{ itemId: "item-chador", quantity: 1 }],
    price: 1200,
    status: "ACTIVE",
    updatedAt: "2026-09-18T10:15:00.000Z",
  },
  {
    id: "pkg-chador-2-porda",
    name: "Chador + 2 Pieces Porda",
    description: "Matching chador with a pair of curtains.",
    items: [
      { itemId: "item-chador", quantity: 1 },
      { itemId: "item-porda", quantity: 2 },
    ],
    price: 1950,
    status: "ACTIVE",
    updatedAt: "2026-09-20T08:40:00.000Z",
  },
  {
    id: "pkg-chador-4-porda",
    name: "Chador + 4 Pieces Porda",
    description: "Chador with curtains for two windows.",
    items: [
      { itemId: "item-chador", quantity: 1 },
      { itemId: "item-porda", quantity: 4 },
    ],
    price: 2750,
    status: "ACTIVE",
    updatedAt: "2026-09-22T12:05:00.000Z",
  },
  {
    id: "pkg-chador-2-porda-2-pillow",
    name: "Chador + 2 Pieces Porda + 2 Pillow Covers",
    description: "Chador, a pair of curtains and matching pillow covers.",
    items: [
      { itemId: "item-chador", quantity: 1 },
      { itemId: "item-porda", quantity: 2 },
      { itemId: "item-pillow-cover", quantity: 2 },
    ],
    price: 2200,
    status: "ACTIVE",
    updatedAt: "2026-09-25T16:30:00.000Z",
  },
  {
    id: "pkg-chador-4-porda-2-pillow",
    name: "Chador + 4 Pieces Porda + 2 Pillow Covers",
    description: "Our most popular set for a full bedroom refresh.",
    items: [
      { itemId: "item-chador", quantity: 1 },
      { itemId: "item-porda", quantity: 4 },
      { itemId: "item-pillow-cover", quantity: 2 },
    ],
    price: 2990,
    status: "ACTIVE",
    updatedAt: "2026-09-27T09:00:00.000Z",
  },
  {
    id: "pkg-complete-bedroom",
    name: "Complete Bedroom Combo",
    description: "Everything for the bedroom: bedding, curtains and cushions.",
    items: [
      { itemId: "item-chador", quantity: 1 },
      { itemId: "item-comforter", quantity: 1 },
      { itemId: "item-porda", quantity: 4 },
      { itemId: "item-pillow-cover", quantity: 2 },
      { itemId: "item-cushion-cover", quantity: 4 },
    ],
    price: 5800,
    status: "ACTIVE",
    updatedAt: "2026-09-29T14:20:00.000Z",
  },
  {
    id: "pkg-chador-protector",
    name: "Chador + Mattress Protector",
    description: "Seasonal set, currently paused.",
    items: [
      { itemId: "item-chador", quantity: 1 },
      { itemId: "item-mattress-protector", quantity: 1 },
    ],
    price: 1900,
    status: "INACTIVE",
    updatedAt: "2026-08-30T11:45:00.000Z",
  },
];
