import express from "express";
import addressRoutes from "./Address.routes";
import blogPostRoutes from "./BlogPost.routes";
import cartRoutes from "./Cart.routes";
import cartItemRoutes from "./CartItem.routes";
import categoryRoutes from "./Category.routes";
import newsletterSubscriptionRoutes from "./NewsletterSubscription.routes";
import productRoutes from "./Product.routes";
import productImageRoutes from "./ProductImage.routes";
import productIncotermRoutes from "./ProductIncoterm.routes";
import productSpecificationRoutes from "./ProductSpecification.routes";
import productTargetMarketRoutes from "./ProductTargetMarket.routes";
import productUseCaseRoutes from "./ProductUseCase.routes";
import productViewRoutes from "./ProductView.routes";
import quoteRequestRoutes from "./QuoteRequest.routes";
import recentlyViewedRoutes from "./RecentlyViewed.routes";
import subcategoryRoutes from "./Subcategory.routes";
import supplierRoutes from "./Supplier.routes";

const routes = () => {
  const router = express.Router();

  router.use("/address", addressRoutes());
  router.use("/blog-post", blogPostRoutes());
  router.use("/cart", cartRoutes());
  router.use("/cart-item", cartItemRoutes());
  router.use("/category", categoryRoutes());
  router.use("/newsletter-subscription", newsletterSubscriptionRoutes());
  router.use("/product", productRoutes());
  router.use("/product-image", productImageRoutes());
  router.use("/product-incoterm", productIncotermRoutes());
  router.use("/product-specification", productSpecificationRoutes());
  router.use("/product-target-market", productTargetMarketRoutes());
  router.use("/product-use-case", productUseCaseRoutes());
  router.use("/product-view", productViewRoutes());
  router.use("/quote-request", quoteRequestRoutes());
  router.use("/recently-viewed", recentlyViewedRoutes());
  router.use("/subcategory", subcategoryRoutes());
  router.use("/supplier", supplierRoutes());

  return router;
};

export default routes;
