import { Config, File, Notification } from "../models/System";
import { User } from "../models/User";
import { ConfigType } from "../utilities/constants/Constants";
import LogService from "../services/Log/Log.service";

export const seedSystem = async () => {
  try {
    LogService.LogInfo("Seeding System models...");

    // Seed Config
    await seedConfig();
    
    // Seed File
    await seedFile();
    
    // Seed Notification (requires User, so we'll seed after User is created)
    // This will be called from user.seed.ts after users are created
    
    LogService.LogInfo("System models seeded successfully");
  } catch (error: any) {
    LogService.LogError(`System seed error: ${error.message}`);
    throw error;
  }
};

const seedConfig = async () => {
  const configs = [
    {
      key: "site_name",
      object_type: "Site",
      type: ConfigType.STRING,
      value: "Abyssinia B2B Marketplace",
    },
    {
      key: "site_email",
      object_type: "Site",
      type: ConfigType.STRING,
      value: "info@abyssinab2b.com",
    },
    {
      key: "site_phone",
      object_type: "Site",
      type: ConfigType.STRING,
      value: "+251 911 854 545",
    },
    {
      key: "maintenance_mode",
      object_type: "Site",
      type: ConfigType.BOOLEAN,
      value: "false",
    },
    {
      key: "max_file_size",
      object_type: "File",
      type: ConfigType.INTEGER,
      value: "10485760", // 10MB in bytes
    },
    {
      key: "allowed_file_types",
      object_type: "File",
      type: ConfigType.STRING,
      value: "image/jpeg,image/png,image/gif,application/pdf",
    },
    {
      key: "pagination_limit",
      object_type: "System",
      type: ConfigType.INTEGER,
      value: "20",
    },
  ];

  for (const config of configs) {
    await Config.findOrCreate({
      where: { key: config.key },
      defaults: config,
    });
  }
  LogService.LogInfo(`Seeded ${configs.length} config entries`);
};

const seedFile = async () => {
  const files = [
    {
      name: "default-avatar.png",
      type: "image/png",
      size: 10240,
      path: "/uploads/avatars/default-avatar.png",
    },
    {
      name: "default-product.jpg",
      type: "image/jpeg",
      size: 51200,
      path: "/uploads/products/default-product.jpg",
    },
    {
      name: "logo.png",
      type: "image/png",
      size: 25600,
      path: "/uploads/logo.png",
    },
  ];

  for (const file of files) {
    await File.findOrCreate({
      where: { path: file.path },
      defaults: file,
    });
  }
  LogService.LogInfo(`Seeded ${files.length} file entries`);
};

export const seedNotification = async (userId: string) => {
  const notifications = [
    {
      notification_title: "Welcome to Abyssinia B2B",
      notification_body: "Thank you for joining our platform. Start exploring products and connect with suppliers.",
      notification_type: "Success",
      notification_category: "Info",
      is_read: false,
      user_id: userId,
      notification_date: new Date(),
      notification_url: "/dashboard",
    },
    {
      notification_title: "Profile Update Required",
      notification_body: "Please complete your profile to start trading on our platform.",
      notification_type: "Info",
      notification_category: "Info",
      is_read: false,
      user_id: userId,
      notification_date: new Date(),
      notification_url: "/profile",
    },
  ];

  for (const notification of notifications) {
    await Notification.create(notification);
  }
};
