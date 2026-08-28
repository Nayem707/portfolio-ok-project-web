import { Route } from "react-router-dom";

import Home from "@/pages/public/Home";
import Products from "@/pages/public/Products";
import ProductDetails from "@/pages/public/ProductDetails";
import Categories from "@/pages/public/Categories";
import NotFound from "@/pages/public/NotFound";

import { PUBLIC_PATHS } from "@/routes/public/public.paths";

/**
 * Public storefront routes. Rendered inside MainLayout.
 */
export const publicRoutes = (
  <>
    <Route path={PUBLIC_PATHS.HOME} element={<Home />} />
    <Route path={PUBLIC_PATHS.PRODUCTS} element={<Products />} />
    <Route path={PUBLIC_PATHS.PRODUCT_DETAILS} element={<ProductDetails />} />
    <Route path={PUBLIC_PATHS.CATEGORIES} element={<Categories />} />
  </>
);

/**
 * Catch-all 404 route. Rendered inside MainLayout.
 */
export const notFoundRoute = (
  <Route path={PUBLIC_PATHS.NOT_FOUND} element={<NotFound />} />
);
