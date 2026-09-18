import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "@/services/api";

const asArray = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.data)) return value.data;
  return [];
};

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

const defaultFirstVisitPopup = {
  image:
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1400&q=80",
  buttonText: "Shop Now",
  buttonUrl: "/products",
  alt: "Welcome promotion",
};

export const defaultSections = () => ({
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
      buttonUrl: "/products?category=electronics",
      image:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80",
    },
    right: {
      eyebrow: "New Arrivals",
      title: "Fresh Fashion Drops",
      description: "Discover the newest styles added to our collection.",
      buttonText: "Explore",
      buttonUrl: "/products?category=fashion",
      image:
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80",
    },
  },
  firstVisitPopup: {
    key: "firstVisitPopup",
    label: "First Visit Popup",
    active: true,
    title: "First visit popup",
    ...defaultFirstVisitPopup,
  },
});

const mapSectionKey = (key) => {
  if (key === "categories") return "category";
  if (key === "newArrivals") return "newArrival";
  return key;
};

const mapApiSectionKey = (key) => {
  if (key === "category") return "categories";
  if (key === "newArrival") return "newArrivals";
  return key;
};

export const mapHomepageSectionData = (baseSections, sections = []) => {
  const sectionList = asArray(sections);
  const next = { ...baseSections };

  for (const section of sectionList) {
    const key = mapSectionKey(section.sectionKey);
    if (!next[key]) continue;

    const content =
      section.content && typeof section.content === "object"
        ? section.content
        : {};

    next[key] = {
      ...next[key],
      ...content,
      title: section.title ?? next[key].title,
      subtitle: section.subtitle ?? next[key].subtitle,
      active: section.active ?? next[key].active,
      sortOrder: section.sortOrder ?? next[key].sortOrder,
    };
  }

  return next;
};

const META_DRAFT_KEYS = new Set([
  "key",
  "label",
  "title",
  "subtitle",
  "active",
  "sortOrder",
]);

export const toHomepageSectionPayload = (draft = {}) => {
  const content = {};
  Object.entries(draft).forEach(([field, value]) => {
    if (META_DRAFT_KEYS.has(field)) return;
    content[field] = value;
  });

  return {
    ...(draft.title !== undefined ? { title: draft.title } : {}),
    ...(draft.subtitle !== undefined ? { subtitle: draft.subtitle } : {}),
    ...(draft.active !== undefined ? { active: Boolean(draft.active) } : {}),
    ...(draft.sortOrder !== undefined ? { sortOrder: draft.sortOrder } : {}),
    content,
  };
};

export const fetchPublicHomepage = createAsyncThunk(
  "homePage/fetchPublicHomepage",
  async (_, { rejectWithValue }) => {
    try {
      const [homePayload, sectionsPayload, slidesPayload] = await Promise.all([
        api.getHomepage(),
        api.getHomepageSections(),
        api.getHeroSlides(),
      ]);

      const homeSections = asArray(homePayload?.sections);
      const fallbackSections = asArray(sectionsPayload);
      const homeSlides = asArray(homePayload?.heroSlides);
      const fallbackSlides = asArray(slidesPayload);

      // Prefer the full sections list so inactive sections stay controllable.
      const sections =
        fallbackSections.length > 0 ? fallbackSections : homeSections;

      return {
        sections,
        heroSlides: homeSlides.length > 0 ? homeSlides : fallbackSlides,
        categories: asArray(homePayload?.categories),
        featured: asArray(homePayload?.featured),
        popular: asArray(homePayload?.popular),
        newArrivals: asArray(homePayload?.newArrivals),
      };
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error?.message || "Failed to load homepage",
      );
    }
  },
);

export const fetchHomepageSections = createAsyncThunk(
  "homePage/fetchHomepageSections",
  async (_, { rejectWithValue }) => {
    try {
      const sections = await api.getHomepageSections();
      return asArray(sections);
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error?.message || "Failed to load sections",
      );
    }
  },
);

export const saveHomePageSection = createAsyncThunk(
  "homePage/saveHomePageSection",
  async ({ sectionKey, data }, { rejectWithValue }) => {
    try {
      const apiKey = mapApiSectionKey(sectionKey);
      const payload = toHomepageSectionPayload(data);
      const saved = await api.updateHomepageSection(apiKey, payload);
      return { sectionKey, data, saved };
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error?.message || "Failed to save section",
      );
    }
  },
);

const initialState = {
  sections: defaultSections(),
  heroSlides,
  categories: [],
  featured: [],
  popular: [],
  newArrivals: [],
  loading: false,
  saving: false,
  hydrated: false,
  error: null,
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
      state.sections = defaultSections();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPublicHomepage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPublicHomepage.fulfilled, (state, action) => {
        state.loading = false;
        state.hydrated = true;
        state.error = null;
        state.sections = mapHomepageSectionData(
          defaultSections(),
          action.payload.sections,
        );
        state.heroSlides = asArray(action.payload.heroSlides);
        state.categories = asArray(action.payload.categories);
        state.featured = asArray(action.payload.featured);
        state.popular = asArray(action.payload.popular);
        state.newArrivals = asArray(action.payload.newArrivals);

        if (state.heroSlides.length > 0) {
          state.sections.hero = {
            ...state.sections.hero,
            slides: state.heroSlides,
          };
        }
      })
      .addCase(fetchPublicHomepage.rejected, (state, action) => {
        state.loading = false;
        state.hydrated = true;
        state.error = action.payload || "Failed to load homepage";
      })
      .addCase(fetchHomepageSections.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHomepageSections.fulfilled, (state, action) => {
        state.loading = false;
        state.hydrated = true;
        state.error = null;
        state.sections = mapHomepageSectionData(
          defaultSections(),
          action.payload,
        );
        if (state.heroSlides.length > 0) {
          state.sections.hero = {
            ...state.sections.hero,
            slides: state.heroSlides,
          };
        }
      })
      .addCase(fetchHomepageSections.rejected, (state, action) => {
        state.loading = false;
        state.hydrated = true;
        state.error = action.payload || "Failed to load sections";
      })
      .addCase(saveHomePageSection.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(saveHomePageSection.fulfilled, (state, action) => {
        state.saving = false;
        const { sectionKey, data, saved } = action.payload;
        if (!state.sections[sectionKey]) return;
        const content =
          saved?.content && typeof saved.content === "object"
            ? saved.content
            : {};
        state.sections[sectionKey] = {
          ...state.sections[sectionKey],
          ...data,
          ...content,
          title: saved?.title ?? data.title ?? state.sections[sectionKey].title,
          subtitle:
            saved?.subtitle ??
            data.subtitle ??
            state.sections[sectionKey].subtitle,
          active:
            saved?.active ?? data.active ?? state.sections[sectionKey].active,
        };
      })
      .addCase(saveHomePageSection.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload || "Failed to save section";
      });
  },
});

export const { updateHomePageSection, resetHomePageSections } =
  homePageSlice.actions;
export default homePageSlice.reducer;
