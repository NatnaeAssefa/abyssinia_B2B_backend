import {
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
} from "../models/MarketPlace";
import { User } from "../models/User";
import ModelSync from "../models/index";
import sequelize from "../database/sequelize";
import { QuoteStatus } from "../models/MarketPlace/QuoteRequest";
import { AddressType } from "../models/MarketPlace/Address";
import LogService from "../services/Log/Log.service";
import { seedSystem } from "./system.seed";
import { seedUser } from "./user.seed";

export const seedMarketPlace = async () => {
  try {
    LogService.LogInfo("Seeding MarketPlace models...");

    // Seed in dependency order
    await seedCategory();
    await seedSubcategory();
    await seedSupplier();
    await seedProduct();
    await seedProductImage();
    await seedProductSpecification();
    await seedProductIncoterm();
    await seedProductTargetMarket();
    await seedProductUseCase();
    await seedCart();
    await seedCartItem();
    await seedQuoteRequest();
    await seedBlogPost();
    await seedNewsletterSubscription();
    await seedRecentlyViewed();
    await seedProductView();
    await seedAddress();

    LogService.LogInfo("MarketPlace models seeded successfully");
  } catch (error: any) {
    LogService.LogError(`MarketPlace seed error: ${error.message}`);
    throw error;
  }
};

const seedCategory = async () => {
  const categories = [
    {
      name: "Agriculture",
      slug: "agriculture",
      description: "Agricultural products, equipment, and supplies",
      image: "https://www.croptracker.com/images/precision_ag/tool_tiles_field.png",
      icon: "Tractor",
      color: "from-green-800/80 to-green-700/60",
      order: 1,
      is_active: true,
    },
    {
      name: "Food and Beverage",
      slug: "food-beverage",
      description: "Food products, beverages, and culinary items",
      image: "https://cdn.prod.website-files.com/63cf34956bc59159af577c42/63ea765f1645a485e7a9f091_Food%20%26%20Beverage.webp",
      icon: "Utensils",
      color: "from-red-800/80 to-red-700/60",
      order: 2,
      is_active: true,
    },
    {
      name: "Apparel, Textile and Fashion",
      slug: "apparel-textile-fashion",
      description: "Premium clothing, fabrics, and fashion accessories",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80&auto=format&fit=crop",
      icon: "Shirt",
      color: "from-blue-900/80 to-blue-800/60",
      order: 3,
      is_active: true,
    },
    {
      name: "Industry & Machinery",
      slug: "industry-machinery",
      description: "Industrial equipment, machinery, and tools",
      image: "https://www.nmh-sro.com/wp-content/uploads/2018/12/original-equipment-manfacturing-vyrobca-zariadeni-a-komponentov-1024x683.jpg",
      icon: "Cog",
      color: "from-gray-800/80 to-gray-700/60",
      order: 4,
      is_active: true,
    },
    {
      name: "Electronic & Communication",
      slug: "electronic-communication",
      description: "Electronics, gadgets, and communication devices",
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80&auto=format&fit=crop",
      icon: "Smartphone",
      color: "from-purple-900/80 to-purple-800/60",
      order: 5,
      is_active: true,
    },
    {
      name: "Construction & Real Estate",
      slug: "construction-real-estate",
      description: "Building materials, construction equipment, and real estate services",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ_g5lDSid1RkFmRztplUoWVr1xu1C1N5BX1w&s",
      icon: "Hammer",
      color: "from-orange-800/80 to-orange-700/60",
      order: 6,
      is_active: true,
    },
    {
      name: "Home Furniture & Living",
      slug: "home-furniture-living",
      description: "Furniture, home decor, and living essentials",
      image: "https://leathergallery.co.za/cdn/shop/articles/Blog_Covers_-_2024-09-19T091556.704_5cb3ae43-b480-425a-b7b8-03449fe9e4f6_1600x.png?v=1730293216",
      icon: "Sofa",
      color: "from-amber-800/80 to-amber-700/60",
      order: 7,
      is_active: true,
    },
    {
      name: "Metals and Minerals",
      slug: "metals-minerals",
      description: "Metals, minerals, and mining products",
      image: "https://carboncredits.com/wp-content/uploads/2024/10/shutterstock_1985033336.jpg",
      icon: "Pickaxe",
      color: "from-zinc-800/80 to-zinc-700/60",
      order: 8,
      is_active: true,
    },
    {
      name: "Chemicals",
      slug: "chemicals",
      description: "Chemical products, compounds, and materials",
      image: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&q=80&auto=format&fit=crop",
      icon: "FlaskConical",
      color: "from-cyan-900/80 to-cyan-800/60",
      order: 9,
      is_active: true,
    },
    {
      name: "Beauty, Personal Care & Health",
      slug: "beauty-personal-care-health",
      description: "Beauty products, personal care items, and health supplies",
      image: "https://www.heinens.com/content/uploads/2022/08/Heinens-Health-And-Beauty-products-800x550-1.jpg",
      icon: "Heart",
      color: "from-pink-800/80 to-pink-700/60",
      order: 10,
      is_active: true,
    },
  ];

  for (const category of categories) {
    await Category.findOrCreate({
      where: { slug: category.slug },
      defaults: category,
    });
  }
  LogService.LogInfo(`Seeded ${categories.length} categories`);
};

const seedSubcategory = async () => {
  const agricultureCategory = await Category.findOne({ where: { slug: "agriculture" } });
  const foodCategory = await Category.findOne({ where: { slug: "food-beverage" } });

  const subcategories = [
    {
      category_id: agricultureCategory?.id,
      name: "Coffee",
      slug: "coffee",
      description: "Premium Ethiopian coffee beans",
      image: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&q=80&auto=format&fit=crop",
      order: 1,
      is_active: true,
    },
    {
      category_id: agricultureCategory?.id,
      name: "Sesame & Oilseeds",
      slug: "oilseeds",
      description: "Export-grade sesame seeds and oilseeds",
      image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&q=80&auto=format&fit=crop",
      order: 2,
      is_active: true,
    },
    {
      category_id: agricultureCategory?.id,
      name: "Pulses & Legumes",
      slug: "pulses",
      description: "Chickpeas, lentils, and other pulses",
      image: "https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?w=800&q=80&auto=format&fit=crop",
      order: 3,
      is_active: true,
    },
    {
      category_id: agricultureCategory?.id,
      name: "Spices",
      slug: "spices",
      description: "Premium spices and herbs",
      image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&q=80&auto=format&fit=crop",
      order: 4,
      is_active: true,
    },
    {
      category_id: agricultureCategory?.id,
      name: "Fruits & Vegetables",
      slug: "fruits",
      description: "Fresh fruits and vegetables",
      image: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=800&q=80&auto=format&fit=crop",
      order: 5,
      is_active: true,
    },
    {
      category_id: foodCategory?.id,
      name: "Processed Foods",
      slug: "processed-foods",
      description: "Processed and packaged food products",
      image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80&auto=format&fit=crop",
      order: 1,
      is_active: true,
    },
  ];

  for (const subcategory of subcategories) {
    if (subcategory.category_id) {
      await Subcategory.findOrCreate({
        where: { category_id: subcategory.category_id, slug: subcategory.slug },
        defaults: subcategory,
      });
    }
  }
  LogService.LogInfo(`Seeded ${subcategories.length} subcategories`);
};

const seedSupplier = async () => {
  const supplierUsers = await User.findAll({
    where: { email: ["supplier1@abyssinab2b.com", "supplier2@abyssinab2b.com"] },
  });

  const suppliers = [
    {
      user_id: supplierUsers[0]?.id,
      company_name: "Humera Agri Export PLC",
      business_license: "BL-2024-001",
      tax_id: "TAX-ET-123456",
      experience: "15+ years",
      capacity: "5000 MT/year",
      description: "Leading exporter of sesame seeds and pulses from Humera region",
      website: "https://humeraagri.com",
      is_verified: true,
      verification_date: new Date(),
      is_active: true,
    },
    {
      user_id: supplierUsers[1]?.id,
      company_name: "Yirgacheffe Coffee Cooperative",
      business_license: "BL-2024-002",
      tax_id: "TAX-ET-123457",
      experience: "20+ years",
      capacity: "3000 MT/year",
      description: "Premium specialty coffee from Yirgacheffe region",
      website: "https://yirgacheffecoffee.com",
      is_verified: true,
      verification_date: new Date(),
      is_active: true,
    },
  ];

  for (const supplier of suppliers) {
    if (supplier.user_id) {
      await Supplier.findOrCreate({
        where: { user_id: supplier.user_id },
        defaults: supplier,
      });
    }
  }
  LogService.LogInfo(`Seeded ${suppliers.length} suppliers`);
};

const seedProduct = async () => {
  const agricultureCategory = await Category.findOne({ where: { slug: "agriculture" } });
  const coffeeSubcategory = await Subcategory.findOne({ where: { slug: "coffee" } });
  const oilseedsSubcategory = await Subcategory.findOne({ where: { slug: "oilseeds" } });
  const pulsesSubcategory = await Subcategory.findOne({ where: { slug: "pulses" } });
  const spicesSubcategory = await Subcategory.findOne({ where: { slug: "spices" } });
  const fruitsSubcategory = await Subcategory.findOne({ where: { slug: "fruits" } });

  const suppliers = await Supplier.findAll();

  const products = [
    {
      name: "Ethiopian Arabica Coffee - Yirgacheffe",
      slug: "ethiopian-arabica-coffee-yirgacheffe",
      description: "Premium quality Ethiopian Arabica coffee from the renowned Yirgacheffe region. Known for its floral and citrus notes with a bright acidity.",
      short_description: "Premium Yirgacheffe coffee with floral and citrus notes",
      category_id: agricultureCategory?.id,
      subcategory_id: coffeeSubcategory?.id,
      supplier_id: suppliers[1]?.id,
      origin: "Yirgacheffe, Ethiopia",
      grade: "Grade 1",
      purity: "99.5%",
      moisture: "≤ 10%",
      form: "Green Beans",
      packaging: "60 kg jute bags",
      moq: "1 x 20ft container",
      availability: "Year-round",
      price: null,
      currency: "USD",
      is_featured: true,
      is_active: true,
      in_stock: true,
      meta_title: "Ethiopian Yirgacheffe Coffee - Premium Arabica Beans",
      meta_description: "Export-grade Yirgacheffe coffee beans from Ethiopia",
      view_count: 0,
    },
    {
      name: "White Sesame Seed",
      slug: "white-sesame-seed",
      description: "Premium quality Ethiopian white sesame seeds sourced from the renowned Humera region. Known for their high oil content and excellent flavor profile.",
      short_description: "Premium white sesame seeds from Humera region",
      category_id: agricultureCategory?.id,
      subcategory_id: oilseedsSubcategory?.id,
      supplier_id: suppliers[0]?.id,
      origin: "Humera, Ethiopia",
      grade: "Export Grade",
      purity: "99%+",
      moisture: "≤ 7%",
      form: "Raw / Cleaned",
      packaging: "50 kg PP bags",
      moq: "1 x 20ft container",
      availability: "Seasonal (Oct - Mar)",
      price: null,
      currency: "USD",
      is_featured: true,
      is_active: true,
      in_stock: true,
      meta_title: "White Sesame Seed - Export Grade from Ethiopia",
      meta_description: "Premium white sesame seeds from Humera, Ethiopia",
      view_count: 0,
    },
    {
      name: "Kabuli Chickpeas",
      slug: "kabuli-chickpeas",
      description: "Large, creamy-colored Kabuli chickpeas perfect for hummus and other culinary applications.",
      short_description: "Premium Kabuli chickpeas for export",
      category_id: agricultureCategory?.id,
      subcategory_id: pulsesSubcategory?.id,
      supplier_id: suppliers[0]?.id,
      origin: "Debre Zeit, Ethiopia",
      grade: "Premium",
      purity: "98%+",
      moisture: "≤ 12%",
      form: "Whole",
      packaging: "25 kg PP bags",
      moq: "1 x 20ft container",
      availability: "Year-round",
      price: null,
      currency: "USD",
      is_featured: false,
      is_active: true,
      in_stock: true,
      meta_title: "Kabuli Chickpeas - Premium Quality",
      meta_description: "Export-grade Kabuli chickpeas from Ethiopia",
      view_count: 0,
    },
    {
      name: "Ethiopian Ginger",
      slug: "ethiopian-ginger",
      description: "Fresh, aromatic Ethiopian ginger with strong flavor and high essential oil content.",
      short_description: "Premium fresh ginger from Ethiopia",
      category_id: agricultureCategory?.id,
      subcategory_id: spicesSubcategory?.id,
      supplier_id: suppliers[0]?.id,
      origin: "South Region, Ethiopia",
      grade: "Grade A",
      purity: "100%",
      moisture: "≤ 12%",
      form: "Fresh / Dried",
      packaging: "20 kg cartons",
      moq: "500kg",
      availability: "Year-round",
      price: null,
      currency: "USD",
      is_featured: false,
      is_active: true,
      in_stock: true,
      meta_title: "Ethiopian Ginger - Premium Quality",
      meta_description: "Fresh and dried ginger from Ethiopia",
      view_count: 0,
    },
    {
      name: "Hass Avocado",
      slug: "hass-avocado",
      description: "Premium Hass avocados with creamy texture and rich flavor, perfect for export markets.",
      short_description: "Export-quality Hass avocados",
      category_id: agricultureCategory?.id,
      subcategory_id: fruitsSubcategory?.id,
      supplier_id: suppliers[0]?.id,
      origin: "Central Ethiopia",
      grade: "Export Quality",
      purity: "100%",
      moisture: null,
      form: "Fresh",
      packaging: "4 kg cartons",
      moq: "1000kg",
      availability: "Seasonal (Mar - Sep)",
      price: null,
      currency: "USD",
      is_featured: true,
      is_active: true,
      in_stock: false,
      meta_title: "Hass Avocado - Export Quality from Ethiopia",
      meta_description: "Premium Hass avocados for export",
      view_count: 0,
    },
    {
      name: "Premium Frankincense",
      slug: "premium-frankincense",
      description: "High-quality frankincense resin from the Tigray region, used in perfumes and traditional medicine.",
      short_description: "Premium frankincense resin from Tigray",
      category_id: agricultureCategory?.id,
      subcategory_id: null,
      supplier_id: suppliers[0]?.id,
      origin: "Tigray, Ethiopia",
      grade: "First Grade",
      purity: "100%",
      moisture: null,
      form: "Resin",
      packaging: "10 kg bags",
      moq: "100kg",
      availability: "Year-round",
      price: null,
      currency: "USD",
      is_featured: false,
      is_active: true,
      in_stock: true,
      meta_title: "Premium Frankincense - First Grade",
      meta_description: "High-quality frankincense resin from Ethiopia",
      view_count: 0,
    },
  ];

  const createdProducts = [];
  for (const product of products) {
    if (product.category_id && product.supplier_id) {
      const [createdProduct] = await Product.findOrCreate({
        where: { slug: product.slug },
        defaults: product,
      });
      createdProducts.push(createdProduct);
    }
  }
  LogService.LogInfo(`Seeded ${createdProducts.length} products`);
  return createdProducts;
};

const seedProductImage = async () => {
  const products = await Product.findAll();

  const productImages = [
    {
      product_id: products[0]?.id,
      url: "https://i0.wp.com/1zpresso.coffee/wp-content/uploads/2025/07/1Z%E8%8B%B1-blog%E5%9C%96%E7%89%871200x675-Arabica.png?ssl=1",
      alt: "Ethiopian Arabica Coffee Beans",
      order: 0,
      is_primary: true,
    },
    {
      product_id: products[0]?.id,
      url: "https://images.pexels.com/photos/30444147/pexels-photo-30444147/free-photo-of-close-up-of-dewy-coffee-beans-with-rich-texture.jpeg",
      alt: "Coffee beans close up",
      order: 1,
      is_primary: false,
    },
    {
      product_id: products[1]?.id,
      url: "https://www.greendna.in/cdn/shop/products/seasame_1024x.jpg?v=1562518090",
      alt: "White Sesame Seeds",
      order: 0,
      is_primary: true,
    },
    {
      product_id: products[2]?.id,
      url: "https://flourist.com/cdn/shop/products/DC81EFFB-91E6-4649-BE20-D7305782F9D0.jpg?v=1621638501",
      alt: "Kabuli Chickpeas",
      order: 0,
      is_primary: true,
    },
    {
      product_id: products[3]?.id,
      url: "https://www.hajuta.com/wp-content/uploads/2023/07/Ethiopian-Dry-Ginger.jpg",
      alt: "Ethiopian Ginger",
      order: 0,
      is_primary: true,
    },
    {
      product_id: products[4]?.id,
      url: "https://gregalder.com/yardposts/wp-content/uploads/2020/06/hass-avocado-tree-profile-1.jpg",
      alt: "Hass Avocado",
      order: 0,
      is_primary: true,
    },
    {
      product_id: products[5]?.id,
      url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcStwxY45iWk8s6v-Kjg2T5n-69O9SEJddvUBw&s",
      alt: "Premium Frankincense",
      order: 0,
      is_primary: true,
    },
  ];

  for (const image of productImages) {
    if (image.product_id) {
      await ProductImage.create(image);
    }
  }
  LogService.LogInfo(`Seeded ${productImages.length} product images`);
};

const seedProductSpecification = async () => {
  const products = await Product.findAll();

  const specifications = [
    {
      product_id: products[0]?.id,
      label: "Purity",
      value: "99.5%",
      order: 0,
    },
    {
      product_id: products[0]?.id,
      label: "Moisture",
      value: "≤ 10%",
      order: 1,
    },
    {
      product_id: products[0]?.id,
      label: "Oil Content",
      value: "12-13%",
      order: 2,
    },
    {
      product_id: products[1]?.id,
      label: "Purity",
      value: "99%+",
      order: 0,
    },
    {
      product_id: products[1]?.id,
      label: "Moisture",
      value: "≤ 7%",
      order: 1,
    },
    {
      product_id: products[1]?.id,
      label: "Oil Content",
      value: "50-55%",
      order: 2,
    },
    {
      product_id: products[1]?.id,
      label: "FFA",
      value: "≤ 2%",
      order: 3,
    },
    {
      product_id: products[2]?.id,
      label: "Purity",
      value: "98%+",
      order: 0,
    },
    {
      product_id: products[2]?.id,
      label: "Moisture",
      value: "≤ 12%",
      order: 1,
    },
    {
      product_id: products[2]?.id,
      label: "Size",
      value: "8-9mm",
      order: 2,
    },
  ];

  for (const spec of specifications) {
    if (spec.product_id) {
      await ProductSpecification.create(spec);
    }
  }
  LogService.LogInfo(`Seeded ${specifications.length} product specifications`);
};

const seedProductIncoterm = async () => {
  const products = await Product.findAll();

  const incoterms = [
    { product_id: products[0]?.id, term: "EXW" },
    { product_id: products[0]?.id, term: "FOB" },
    { product_id: products[0]?.id, term: "CIF" },
    { product_id: products[1]?.id, term: "EXW" },
    { product_id: products[1]?.id, term: "FOB" },
    { product_id: products[1]?.id, term: "CIF" },
    { product_id: products[2]?.id, term: "FOB" },
    { product_id: products[2]?.id, term: "CIF" },
    { product_id: products[3]?.id, term: "EXW" },
    { product_id: products[3]?.id, term: "FOB" },
  ];

  for (const incoterm of incoterms) {
    if (incoterm.product_id) {
      await ProductIncoterm.create(incoterm);
    }
  }
  LogService.LogInfo(`Seeded ${incoterms.length} product incoterms`);
};

const seedProductTargetMarket = async () => {
  const products = await Product.findAll();

  const targetMarkets = [
    { product_id: products[0]?.id, market: "EU" },
    { product_id: products[0]?.id, market: "USA" },
    { product_id: products[0]?.id, market: "Japan" },
    { product_id: products[1]?.id, market: "China" },
    { product_id: products[1]?.id, market: "Israel" },
    { product_id: products[1]?.id, market: "Turkey" },
    { product_id: products[1]?.id, market: "EU" },
    { product_id: products[2]?.id, market: "Middle East" },
    { product_id: products[2]?.id, market: "Asia" },
    { product_id: products[3]?.id, market: "EU" },
    { product_id: products[3]?.id, market: "USA" },
  ];

  for (const market of targetMarkets) {
    if (market.product_id) {
      await ProductTargetMarket.create(market);
    }
  }
  LogService.LogInfo(`Seeded ${targetMarkets.length} product target markets`);
};

const seedProductUseCase = async () => {
  const products = await Product.findAll();

  const useCases = [
    { product_id: products[0]?.id, use_case: "Coffee roasting" },
    { product_id: products[0]?.id, use_case: "Specialty coffee" },
    { product_id: products[0]?.id, use_case: "Retail packaging" },
    { product_id: products[1]?.id, use_case: "Oil extraction" },
    { product_id: products[1]?.id, use_case: "Food processing" },
    { product_id: products[1]?.id, use_case: "Bakery" },
    { product_id: products[1]?.id, use_case: "Confectionery" },
    { product_id: products[2]?.id, use_case: "Hummus production" },
    { product_id: products[2]?.id, use_case: "Food processing" },
    { product_id: products[3]?.id, use_case: "Spice blends" },
    { product_id: products[3]?.id, use_case: "Traditional medicine" },
  ];

  for (const useCase of useCases) {
    if (useCase.product_id) {
      await ProductUseCase.create(useCase);
    }
  }
  LogService.LogInfo(`Seeded ${useCases.length} product use cases`);
};

const seedCart = async () => {
  const buyers = await User.findAll({
    where: { email: ["buyer1@abyssinab2b.com", "buyer2@abyssinab2b.com"] },
  });

  for (const buyer of buyers) {
    await Cart.findOrCreate({
      where: { user_id: buyer.id },
      defaults: {
        user_id: buyer.id,
      },
    });
  }
  LogService.LogInfo(`Seeded ${buyers.length} carts`);
};

const seedCartItem = async () => {
  const carts = await Cart.findAll();
  const products = await Product.findAll({ limit: 3 });

  if (carts.length > 0 && products.length > 0) {
    await CartItem.findOrCreate({
      where: { cart_id: carts[0].id, product_id: products[0].id },
      defaults: {
        cart_id: carts[0].id,
        product_id: products[0].id,
        quantity: "100 MT",
        notes: "Need by Q2 2024",
      },
    });

    if (carts.length > 1 && products.length > 1) {
      await CartItem.findOrCreate({
        where: { cart_id: carts[1].id, product_id: products[1].id },
        defaults: {
          cart_id: carts[1].id,
          product_id: products[1].id,
          quantity: "50 MT",
          notes: null,
        },
      });
    }
  }
  LogService.LogInfo("Seeded cart items");
};

const seedQuoteRequest = async () => {
  const buyers = await User.findAll({
    where: { email: ["buyer1@abyssinab2b.com"] },
  });
  const products = await Product.findAll({ limit: 2 });

  const quoteRequests = [
    {
      product_id: products[0]?.id,
      user_id: buyers[0]?.id,
      quantity: "100 MT",
      packaging: "60 kg jute bags",
      destination: "Rotterdam, Netherlands",
      incoterm: "CIF",
      name: null,
      email: buyers[0]?.email || "buyer1@abyssinab2b.com",
      company: "Global Trading Co.",
      phone: "+251911000003",
      notes: "Need samples before final order",
      status: QuoteStatus.PENDING,
    },
    {
      product_id: products[1]?.id,
      user_id: null,
      quantity: "200 MT",
      packaging: "50 kg PP bags",
      destination: "Shanghai, China",
      incoterm: "FOB",
      name: "Guest Buyer",
      email: "guest@example.com",
      company: "China Import Ltd",
      phone: "+86-123-456-7890",
      notes: "Looking for competitive pricing",
      status: QuoteStatus.PENDING,
    },
  ];

  for (const quote of quoteRequests) {
    if (quote.product_id) {
      await QuoteRequest.create(quote);
    }
  }
  LogService.LogInfo(`Seeded ${quoteRequests.length} quote requests`);
};

const seedBlogPost = async () => {
  const blogPosts = [
    {
      title: "Ethiopia's Coffee Export Hits Record High in 2024",
      slug: "ethiopia-coffee-export-record-2024",
      excerpt: "Ethiopian coffee exports reached unprecedented levels this year, with specialty grades commanding premium prices in European markets.",
      content: "Ethiopian coffee exports have reached record-breaking levels in 2024, with specialty coffee grades from regions like Yirgacheffe and Sidamo commanding premium prices in international markets. The country's unique terroir and traditional processing methods continue to attract buyers from Europe, North America, and Asia. This growth is driven by increased demand for traceable, high-quality coffee and Ethiopia's commitment to sustainable farming practices.",
      featured_image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRdcxUHVkjS7jdtkmaySP9TDYApY-AGAVZaGg&s",
      author_name: "Market Analysis Team",
      author_email: "analysis@abyssinab2b.com",
      category: "Market Insights",
      tags: ["coffee", "export", "market-analysis"],
      is_published: true,
      published_at: new Date("2024-12-28"),
      meta_title: "Ethiopia Coffee Export Record 2024",
      meta_description: "Ethiopian coffee exports reach record levels in 2024",
      view_count: 0,
    },
    {
      title: "New Quality Standards for Sesame Exports",
      slug: "new-quality-standards-sesame-exports",
      excerpt: "The Ethiopian Commodity Exchange introduces enhanced quality grading standards for sesame seeds, improving buyer confidence.",
      content: "The Ethiopian Commodity Exchange has introduced new quality grading standards for sesame seed exports, focusing on purity, moisture content, and oil quality. These enhanced standards are expected to improve buyer confidence and command higher prices in international markets. Suppliers are adapting their processing methods to meet these new requirements, ensuring Ethiopia remains competitive in the global sesame market.",
      featured_image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTIkAgKKNb_O_Ju1PfPHJqTGjGYK6E3RGwA4Q&s",
      author_name: "Trade Compliance",
      author_email: "compliance@abyssinab2b.com",
      category: "Regulations",
      tags: ["sesame", "quality-standards", "regulations"],
      is_published: true,
      published_at: new Date("2024-12-20"),
      meta_title: "New Sesame Quality Standards",
      meta_description: "Enhanced quality standards for Ethiopian sesame exports",
      view_count: 0,
    },
    {
      title: "Sustainable Farming Practices Boost Yields",
      slug: "sustainable-farming-practices-boost-yields",
      excerpt: "Ethiopian cooperatives adopting sustainable farming methods see 30% increase in crop yields while maintaining organic certification.",
      content: "Ethiopian agricultural cooperatives that have adopted sustainable farming practices are reporting significant increases in crop yields, with some seeing up to 30% improvement while maintaining organic certification. These practices include crop rotation, organic fertilizers, and water conservation techniques. The success of these initiatives is attracting international buyers who value both quality and sustainability.",
      featured_image: "https://agtech.folio3.com/wp-content/uploads/2026/03/practices-to-increase-crop-yields-featured.jpg",
      author_name: "Sustainability Team",
      author_email: "sustainability@abyssinab2b.com",
      category: "Sustainability",
      tags: ["sustainability", "farming", "organic"],
      is_published: true,
      published_at: new Date("2024-12-15"),
      meta_title: "Sustainable Farming Practices in Ethiopia",
      meta_description: "How sustainable farming is boosting yields in Ethiopia",
      view_count: 0,
    },
  ];

  for (const post of blogPosts) {
    await BlogPost.findOrCreate({
      where: { slug: post.slug },
      defaults: post,
    });
  }
  LogService.LogInfo(`Seeded ${blogPosts.length} blog posts`);
};

const seedNewsletterSubscription = async () => {
  const subscriptions = [
    {
      email: "buyer1@abyssinab2b.com",
      is_active: true,
      subscribed_at: new Date("2024-01-15"),
      source: "footer",
    },
    {
      email: "buyer2@abyssinab2b.com",
      is_active: true,
      subscribed_at: new Date("2024-02-20"),
      source: "popup",
    },
    {
      email: "newsletter@example.com",
      is_active: true,
      subscribed_at: new Date("2024-03-10"),
      source: "footer",
    },
  ];

  for (const subscription of subscriptions) {
    await NewsletterSubscription.findOrCreate({
      where: { email: subscription.email },
      defaults: subscription,
    });
  }
  LogService.LogInfo(`Seeded ${subscriptions.length} newsletter subscriptions`);
};

const seedRecentlyViewed = async () => {
  const buyers = await User.findAll({
    where: { email: ["buyer1@abyssinab2b.com", "buyer2@abyssinab2b.com"] },
  });
  const products = await Product.findAll({ limit: 4 });

  if (buyers.length > 0 && products.length > 0) {
    await RecentlyViewed.findOrCreate({
      where: { user_id: buyers[0].id, product_id: products[0].id },
      defaults: {
        user_id: buyers[0].id,
        product_id: products[0].id,
        viewed_at: new Date(),
      },
    });

    if (products.length > 1) {
      await RecentlyViewed.findOrCreate({
        where: { user_id: buyers[0].id, product_id: products[1].id },
        defaults: {
          user_id: buyers[0].id,
          product_id: products[1].id,
          viewed_at: new Date(Date.now() - 86400000), // 1 day ago
        },
      });
    }

    if (buyers.length > 1 && products.length > 2) {
      await RecentlyViewed.findOrCreate({
        where: { user_id: buyers[1].id, product_id: products[2].id },
        defaults: {
          user_id: buyers[1].id,
          product_id: products[2].id,
          viewed_at: new Date(),
        },
      });
    }
  }
  LogService.LogInfo("Seeded recently viewed products");
};

const seedProductView = async () => {
  const buyers = await User.findAll({ limit: 2 });
  const products = await Product.findAll({ limit: 3 });

  const productViews = [
    {
      product_id: products[0]?.id,
      user_id: buyers[0]?.id,
      ip_address: "192.168.1.100",
      user_agent: "Mozilla/5.0",
      viewed_at: new Date(),
    },
    {
      product_id: products[0]?.id,
      user_id: null,
      ip_address: "192.168.1.101",
      user_agent: "Mozilla/5.0",
      viewed_at: new Date(Date.now() - 3600000), // 1 hour ago
    },
    {
      product_id: products[1]?.id,
      user_id: buyers[1]?.id,
      ip_address: "192.168.1.102",
      user_agent: "Mozilla/5.0",
      viewed_at: new Date(),
    },
  ];

  for (const view of productViews) {
    if (view.product_id) {
      await ProductView.create(view);
    }
  }
  LogService.LogInfo(`Seeded ${productViews.length} product views`);
};

const seedAddress = async () => {
  const buyers = await User.findAll({
    where: { email: ["buyer1@abyssinab2b.com", "buyer2@abyssinab2b.com"] },
  });

  const addresses = [
    {
      user_id: buyers[0]?.id,
      type: AddressType.BILLING,
      street: "123 Main Street",
      city: "Addis Ababa",
      state: "Addis Ababa",
      country: "Ethiopia",
      postal_code: "1000",
      is_default: true,
    },
    {
      user_id: buyers[0]?.id,
      type: AddressType.SHIPPING,
      street: "456 Commerce Road",
      city: "Addis Ababa",
      state: "Addis Ababa",
      country: "Ethiopia",
      postal_code: "1000",
      is_default: false,
    },
    {
      user_id: buyers[1]?.id,
      type: AddressType.BILLING,
      street: "789 Trade Avenue",
      city: "Addis Ababa",
      state: "Addis Ababa",
      country: "Ethiopia",
      postal_code: "1000",
      is_default: true,
    },
  ];

  for (const address of addresses) {
    if (address.user_id) {
      await Address.create(address);
    }
  }
  LogService.LogInfo(`Seeded ${addresses.length} addresses`);
};

export const runMarketPlaceSeed = async () => {
  try {
    ModelSync(sequelize);
    await sequelize.sync({ alter: false, logging: false });
    LogService.LogInfo("Database synced successfully for marketplace seed");

    // Keep dependency order when running this file directly.
    await seedSystem();
    await seedUser();
    await seedMarketPlace();

    LogService.LogInfo("Marketplace seed script completed successfully");
    await sequelize.close();
    process.exit(0);
  } catch (error: any) {
    LogService.LogError(`Marketplace seed script failed: ${error.message}`);
    await sequelize.close();
    process.exit(1);
  }
};

// Run if called directly.
if (require.main === module) {
  runMarketPlaceSeed();
}
