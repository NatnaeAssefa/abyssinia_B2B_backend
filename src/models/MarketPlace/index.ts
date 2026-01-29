import { Sequelize } from "sequelize";
import CategoryFactory, { Category } from "./Category";
import SubcategoryFactory, { Subcategory } from "./Subcategory";
import SupplierFactory, { Supplier } from "./Supplier";
import ProductFactory, { Product } from "./Product";
import ProductImageFactory, { ProductImage } from "./ProductImage";
import ProductSpecificationFactory, { ProductSpecification } from "./ProductSpecification";
import ProductIncotermFactory, { ProductIncoterm } from "./ProductIncoterm";
import ProductTargetMarketFactory, { ProductTargetMarket } from "./ProductTargetMarket";
import ProductUseCaseFactory, { ProductUseCase } from "./ProductUseCase";
import CartFactory, { Cart } from "./Cart";
import CartItemFactory, { CartItem } from "./CartItem";
import QuoteRequestFactory, { QuoteRequest } from "./QuoteRequest";
import BlogPostFactory, { BlogPost } from "./BlogPost";
import NewsletterSubscriptionFactory, { NewsletterSubscription } from "./NewsletterSubscription";
import RecentlyViewedFactory, { RecentlyViewed } from "./RecentlyViewed";
import ProductViewFactory, { ProductView } from "./ProductView";
import AddressFactory, { Address } from "./Address";
import { User } from "../User";

const MarketPlaceModels = (sequelize: Sequelize) => {
  CategoryFactory(sequelize);
  SubcategoryFactory(sequelize);
  SupplierFactory(sequelize);
  ProductFactory(sequelize);
  ProductImageFactory(sequelize);
  ProductSpecificationFactory(sequelize);
  ProductIncotermFactory(sequelize);
  ProductTargetMarketFactory(sequelize);
  ProductUseCaseFactory(sequelize);
  CartFactory(sequelize);
  CartItemFactory(sequelize);
  QuoteRequestFactory(sequelize);
  BlogPostFactory(sequelize);
  NewsletterSubscriptionFactory(sequelize);
  RecentlyViewedFactory(sequelize);
  ProductViewFactory(sequelize);
  AddressFactory(sequelize);

  // ===========================================
  // Category - Subcategory
  Category.hasMany(Subcategory, {
    foreignKey: "category_id",
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  });
  Subcategory.belongsTo(Category, {
    foreignKey: "category_id",
  });

  // Category - Product
  Category.hasMany(Product, {
    foreignKey: "category_id",
    onUpdate: "CASCADE",
    onDelete: "RESTRICT",
  });
  Product.belongsTo(Category, {
    foreignKey: "category_id",
  });

  // Subcategory - Product
  Subcategory.hasMany(Product, {
    foreignKey: "subcategory_id",
    onUpdate: "CASCADE",
    onDelete: "SET NULL",
  });
  Product.belongsTo(Subcategory, {
    foreignKey: "subcategory_id",
  });

  // User - Supplier
  User.hasOne(Supplier, {
    foreignKey: "user_id",
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  });
  Supplier.belongsTo(User, {
    foreignKey: "user_id",
  });

  // Supplier - Product
  Supplier.hasMany(Product, {
    foreignKey: "supplier_id",
    onUpdate: "CASCADE",
    onDelete: "RESTRICT",
  });
  Product.belongsTo(Supplier, {
    foreignKey: "supplier_id",
  });

  // Product - ProductImage
  Product.hasMany(ProductImage, {
    foreignKey: "product_id",
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  });
  ProductImage.belongsTo(Product, {
    foreignKey: "product_id",
  });

  // Product - ProductSpecification
  Product.hasMany(ProductSpecification, {
    foreignKey: "product_id",
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  });
  ProductSpecification.belongsTo(Product, {
    foreignKey: "product_id",
  });

  // Product - ProductIncoterm
  Product.hasMany(ProductIncoterm, {
    foreignKey: "product_id",
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  });
  ProductIncoterm.belongsTo(Product, {
    foreignKey: "product_id",
  });

  // Product - ProductTargetMarket
  Product.hasMany(ProductTargetMarket, {
    foreignKey: "product_id",
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  });
  ProductTargetMarket.belongsTo(Product, {
    foreignKey: "product_id",
  });

  // Product - ProductUseCase
  Product.hasMany(ProductUseCase, {
    foreignKey: "product_id",
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  });
  ProductUseCase.belongsTo(Product, {
    foreignKey: "product_id",
  });

  // User - Cart
  User.hasOne(Cart, {
    foreignKey: "user_id",
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  });
  Cart.belongsTo(User, {
    foreignKey: "user_id",
  });

  // Cart - CartItem
  Cart.hasMany(CartItem, {
    foreignKey: "cart_id",
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  });
  CartItem.belongsTo(Cart, {
    foreignKey: "cart_id",
  });

  // Product - CartItem
  Product.hasMany(CartItem, {
    foreignKey: "product_id",
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  });
  CartItem.belongsTo(Product, {
    foreignKey: "product_id",
  });

  // Product - QuoteRequest
  Product.hasMany(QuoteRequest, {
    foreignKey: "product_id",
    onUpdate: "CASCADE",
    onDelete: "RESTRICT",
  });
  QuoteRequest.belongsTo(Product, {
    foreignKey: "product_id",
  });

  // User - QuoteRequest
  User.hasMany(QuoteRequest, {
    foreignKey: "user_id",
    onUpdate: "CASCADE",
    onDelete: "SET NULL",
  });
  QuoteRequest.belongsTo(User, {
    foreignKey: "user_id",
  });

  // User - RecentlyViewed
  User.hasMany(RecentlyViewed, {
    foreignKey: "user_id",
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  });
  RecentlyViewed.belongsTo(User, {
    foreignKey: "user_id",
  });

  // Product - RecentlyViewed
  Product.hasMany(RecentlyViewed, {
    foreignKey: "product_id",
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  });
  RecentlyViewed.belongsTo(Product, {
    foreignKey: "product_id",
  });

  // Product - ProductView
  Product.hasMany(ProductView, {
    foreignKey: "product_id",
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  });
  ProductView.belongsTo(Product, {
    foreignKey: "product_id",
  });

  // User - ProductView
  User.hasMany(ProductView, {
    foreignKey: "user_id",
    onUpdate: "CASCADE",
    onDelete: "SET NULL",
  });
  ProductView.belongsTo(User, {
    foreignKey: "user_id",
  });

  // User - Address
  User.hasMany(Address, {
    foreignKey: "user_id",
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  });
  Address.belongsTo(User, {
    foreignKey: "user_id",
  });
};

export default MarketPlaceModels;
export {
  Category,
  Subcategory,
  Supplier,
  Product,
  ProductImage,
  ProductSpecification,
  ProductIncoterm,
  ProductTargetMarket,
  ProductUseCase,
  Cart,
  CartItem,
  QuoteRequest,
  BlogPost,
  NewsletterSubscription,
  RecentlyViewed,
  ProductView,
  Address,
};
