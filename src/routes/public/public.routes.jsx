import { Route } from "react-router-dom";

import HomeView from "@/pages/public/home/HomeView";
import ProductsView from "@/pages/public/ProductsView";
import ProductDetailsView from "@/pages/public/ProductDetailsView";
import CategoriesView from "@/pages/public/CategoriesView";
import NotFoundView from "@/pages/public/NotFoundView";
import TrackOrderView from "@/pages/public/TrackOrderView";

import { PUBLIC_PATHS } from "@/routes/public/public.paths";

const publicRouteConfig = [
  { path: PUBLIC_PATHS.HOME, element: <HomeView /> },
  { path: PUBLIC_PATHS.PRODUCTS, element: <ProductsView /> },
  { path: PUBLIC_PATHS.PRODUCT_DETAILS, element: <ProductDetailsView /> },
  { path: PUBLIC_PATHS.CATEGORIES, element: <CategoriesView /> },
  { path: PUBLIC_PATHS.TRACK_ORDER, element: <TrackOrderView /> },
];

export const publicRoutes = publicRouteConfig.map(({ path, element }) => (
  <Route key={path} path={path} element={element} />
));

export const notFoundRoute = (
  <Route
    key={PUBLIC_PATHS.NOT_FOUND}
    path={PUBLIC_PATHS.NOT_FOUND}
    element={<NotFoundView />}
  />
);
