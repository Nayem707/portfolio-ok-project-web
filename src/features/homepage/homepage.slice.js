import { createSlice } from "@reduxjs/toolkit";

const heroSlides = [
  {
    id: 1,
    image: "/image/hero1.png",
    subtitle: "Welcome to Our Store",
    title: "Discover Something Amazing",
    description:
      "Explore our latest collection and find products that perfectly match your style and needs.",
    buttonText: "Explore Now",
    buttonUrl: "/products",
    active: true,
  },
  {
    id: 2,
    image: "/image/hero2.png",
    subtitle: "New Arrivals",
    title: "Summer Collection 2026",
    description:
      "Stay ahead of the trends with our newest summer arrivals. Fresh styles, unbeatable prices.",
    buttonText: "Shop Now",
    buttonUrl: "/products",
    active: true,
  },
  {
    id: 3,
    image: "/image/hero3.png",
    subtitle: "Special Offer",
    title: "Up to 50% Off",
    description:
      "Don't miss out on our biggest sale of the season. Limited time offer on selected items.",
    buttonText: "Grab Deal",
    buttonUrl: "/products?onSale=true",
    active: true,
  },
];

const defaultPerks = [
  {
    id: 1,
    title: "Free Shipping",
    desc: "On orders over $150",
    icon: "TruckIcon",
    active: true,
  },
  {
    id: 2,
    title: "Easy Returns",
    desc: "30-day return policy",
    icon: "ArrowPathIcon",
    active: true,
  },
  {
    id: 3,
    title: "Secure Payments",
    desc: "Protected checkout",
    icon: "ShieldCheckIcon",
    active: true,
  },
  {
    id: 4,
    title: "Flexible Payment",
    desc: "Multiple methods",
    icon: "CreditCardIcon",
    active: true,
  },
];

const initialState = {
  sections: {
    hero: {
      key: "hero",
      label: "Hero Section",
      active: true,
      slides: heroSlides,
    },
    perks: {
      key: "perks",
      label: "Perks Section",
      active: true,
      items: defaultPerks,
    },
    category: {
      key: "category",
      label: "Category Section",
      active: true,
      title: "Shop by Category",
      subtitle: "Find exactly what you’re looking for",
    },
    featured: {
      key: "featured",
      label: "Featured Products",
      active: true,
      title: "Featured Products",
      subtitle: "Hand-picked favorites just for you",
      to: "/products",
    },
    popular: {
      key: "popular",
      label: "Popular Right Now",
      active: true,
      title: "Popular Right Now",
      subtitle: "What everyone’s buying this week",
      to: "/products",
    },
    newArrival: {
      key: "newArrival",
      label: "New Arrivals",
      active: true,
      title: "New Arrivals",
      subtitle: "The latest additions to our store",
      to: "/products?sort=newest",
    },
    promo: {
      key: "promo",
      label: "Promo Section",
      active: true,
      left: {
        eyebrow: "Limited Time",
        title: "Up to 30% off Electronics",
        description: "Upgrade your tech with our best deals of the season.",
        buttonText: "Shop Deals",
        buttonUrl: "/products?category=Electronics",
        image:
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80",
      },
      right: {
        eyebrow: "New Arrivals",
        title: "Fresh Fashion Drops",
        description: "Discover the newest styles added to our collection.",
        buttonText: "Explore",
        buttonUrl: "/products?category=Fashion",
        image:
          "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80",
      },
    },
  },
};

const homePageSlice = createSlice({
  name: "homePage",
  initialState,
  reducers: {
    updateHomePageSection(state, action) {
      const { sectionKey, data } = action.payload;
      if (!state.sections[sectionKey]) return;
      state.sections[sectionKey] = {
        ...state.sections[sectionKey],
        ...data,
      };
    },
    resetHomePageSections(state) {
      state.sections = initialState.sections;
    },
  },
});

export const { updateHomePageSection, resetHomePageSections } =
  homePageSlice.actions;
export default homePageSlice.reducer;
