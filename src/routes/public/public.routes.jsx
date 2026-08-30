import { Route } from "react-router-dom";

import HomeView from "@/pages/public/home/HomeView";
import ProductsView from "@/pages/public/ProductsView";
import ProductDetailsView from "@/pages/public/ProductDetailsView";
import CategoriesView from "@/pages/public/CategoriesView";
import NotFoundView from "@/pages/public/NotFoundView";

import { PUBLIC_PATHS } from "@/routes/public/public.paths";

export const publicRoutes = (
  <>
    <Route path={PUBLIC_PATHS.HOME} element={<HomeView />} />
    <Route path={PUBLIC_PATHS.PRODUCTS} element={<ProductsView />} />
    <Route
      path={PUBLIC_PATHS.PRODUCT_DETAILS}
      element={<ProductDetailsView />}
    />
    <Route path={PUBLIC_PATHS.CATEGORIES} element={<CategoriesView />} />
  </>
);

export const notFoundRoute = (
  <Route path={PUBLIC_PATHS.NOT_FOUND} element={<NotFoundView />} />
);
