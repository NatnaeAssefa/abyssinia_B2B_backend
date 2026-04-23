import ModelSync from "../models/index";
import sequelize from "../database/sequelize";
import { Category } from "../models/MarketPlace";
import LogService from "../services/Log/Log.service";

export const seedExtraCategories = async () => {
  const categories = [
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

  LogService.LogInfo(`Seeded ${categories.length} extra categories`);
};

export const runExtraCategorySeed = async () => {
  try {
    ModelSync(sequelize);
    await sequelize.sync({ alter: false, logging: false });
    await seedExtraCategories();
    await sequelize.close();
    process.exit(0);
  } catch (error: any) {
    LogService.LogError(`Extra category seed failed: ${error.message}`);
    await sequelize.close();
    process.exit(1);
  }
};

if (require.main === module) {
  runExtraCategorySeed();
}
