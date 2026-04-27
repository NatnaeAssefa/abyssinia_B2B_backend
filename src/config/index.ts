import { AccessType, UserType } from "../utilities/constants/Constants";

export const DB_TYPES = {
  MYSQL: "mysql",
  POSTGRES: "postgres",
};

const getDBType = (type?: string) => {
  if (type) {
    if (Object.values(DB_TYPES).indexOf(type) !== -1) return type;
  }
  return DB_TYPES.POSTGRES;
};

export const env: any = {
  // Database
  DB_TYPE: getDBType(process.env.DB_TYPE),
  DB_HOST: process.env.DB_HOST || "185.73.8.1",
  DB_PORT: process.env.DB_PORT || "5432",
  DB_NAME: process.env.DB_NAME || "abyssikq_abyssiniab2b",
  DB_USERNAME: process.env.DB_USERNAME || "abyssikq_abyssinia",
  DB_PASSWORD: process.env.DB_PASSWORD || "abyssiniab2b",

  // Redis
  REDIS_HOST: process.env.REDIS_HOST || "localhost",
  REDIS_PORT: process.env.REDIS_PORT || "6379",

  // Auth
  AUTH_KEY: process.env.AUTH_KEY || "sample_key",

  AUTH_KEY_EXPIRY: process.env.AUTH_KEY_EXPIRY || "6h",

  // Server
  PORT: process.env.PORT || 3000,
  PRODUCTION: process.env.PRODUCTION === "true",

  // Swagger
  SWAGGER_ENABLED: process.env.SWAGGER_ENABLED === "true",

  // Email
  SMTP_HOST: process.env.SMTP_HOST || "sandbox.smtp.mailtrap.io",
  SMTP_PORT: process.env.SMTP_PORT || "587",
  SMTP_USER: process.env.SMTP_USER || "test",
  SMTP_PASS: process.env.SMTP_PASS || "password",

  // System
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost",
  BACKEND_URL: process.env.BACKEND_URL || "http://localhost:3000",
  VERIFICATION_EXPIRY: process.env.VERIFICATION_EXPIRY || 24, // Hours
  RECOVERY_EXPIRY: process.env.RECOVERY_EXPIRY || 24, // Hours

  // Company
  COMPANY_NAME: process.env.COMPANY_NAME || "Read-Sea AI",
  COMPANY_EMAIL: process.env.SMTP_USER || "support@Read-Sea.ai",

  ADMIN_EMAIL: process.env.ADMIN_EMAIL || "admin@Read-Sea.ai",

  ROOT_DIR: "",

  GOOGLE_CERTS_URL: process.env.GOOGLE_CERTS_URL || "",
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
  GOOGLE_AUTH_URL: process.env.GOOGLE_AUTH_URL || "",
  GOOGLE_TOKEN_URL: process.env.GOOGLE_TOKEN_URL || "",
  GOOGLE_USER_INFO_URL: process.env.GOOGLE_USER_INFO_URL || "",

  FACEBOOK_APP_ID: process.env.FACEBOOK_APP_ID || "726041843034437",
  FACEBOOK_APP_SECRET: process.env.FACEBOOK_APP_SECRET || "a081659398cdc2c97f19d6c3f25c4026",
  
  WATER_MARK_IMAGE: process.env.WATER_MARK_IMAGE || "",
  WATER_MARK_IMAGE_DARK: process.env.WATER_MARK_IMAGE_DARK || "",

  // Existing variables...
  CHAPPA_SECRET_KEY: process.env.CHAPPA_SECRET_KEY || "",
  CHAPPA_PUBLIC_KEY: process.env.CHAPPA_PUBLIC_KEY || "",
};
export const constants: any = {
  SYSTEM_CONFIG_KEY: "System Init",
  SYSTEM_CONFIG_TYPE: "string",
  SYSTEM_CONFIG_VALUE: "True",
  BASE_FIRST_NAME: "Bedri",
  BASE_LAST_NAME: "Bahru",
  BASE_PHONE_NUMBER: "251930538714",
  BASE_ROLE: "Super Admin",
  BASE_ROLE_ID: "0f60ea4b-3bad-46c8-b6f5-84d5a815ac6d",
  BASE_TYPE: UserType.SUPER_ADMIN,
  BASE_EMAIL: "bahrubedri@gmail.com",
  BASE_PASSWORD: "1q2w3e4r5t6y7u8i9o0p",

  ADMIN_ROLE: "ADMIN Role",
};

export type AccessRules = {
  group: string;
  rules: { name: string; type: string }[];
};

export const access_rules: AccessRules[] = [
  //  System
  {
    group: "Global",
    rules: [{ name: "access_paranoid", type: AccessType.SUPER_ADMIN }],
  },
  {
    group: "Access Log",
    rules: [
      { name: "read_action_log", type: AccessType.SUPER_ADMIN },
      { name: "write_action_log", type: AccessType.SUPER_ADMIN },
      { name: "delete_action_log", type: AccessType.SUPER_ADMIN },
    ],
  },
  {
    group: "Config",
    rules: [
      { name: "read_config", type: AccessType.SUPER_ADMIN },
      { name: "write_config", type: AccessType.SUPER_ADMIN },
      { name: "delete_config", type: AccessType.SUPER_ADMIN },
    ],
  },
  // Shared
  {
    group: "File",
    rules: [
      { name: "read_file", type: AccessType.ADMIN },
      { name: "write_file", type: AccessType.ADMIN },
      { name: "delete_file", type: AccessType.SUPER_ADMIN },
    ],
  },
  {
    group: "Access Rule",
    rules: [
      { name: "read_access_rule", type: AccessType.ADMIN },
      { name: "write_access_rule", type: AccessType.SUPER_ADMIN },
      { name: "delete_access_rule", type: AccessType.SUPER_ADMIN },
    ],
  },
  {
    group: "Role",
    rules: [
      { name: "read_role", type: AccessType.ADMIN },
      { name: "write_role", type: AccessType.ADMIN },
      { name: "delete_role", type: AccessType.ADMIN },
    ],
  },
  {
    group: "User",
    rules: [
      { name: "read_user", type: AccessType.ADMIN },
      { name: "revoke_user_token", type: AccessType.SUPER_ADMIN },
      { name: "change_user_password", type: AccessType.SUPER_ADMIN },
      { name: "write_user", type: AccessType.ADMIN },
      { name: "delete_user", type: AccessType.SUPER_ADMIN },
    ],
  },
  // Marketplace rules
  {
    group: "Product",
    rules: [
      { name: "read_product", type: AccessType.USER },
      { name: "write_product", type: AccessType.ADMIN },
      { name: "delete_product", type: AccessType.ADMIN },
      { name: "approve_product", type: AccessType.SUPER_ADMIN },
    ],
  },
  {
    group: "Order",
    rules: [
      { name: "read_order", type: AccessType.USER },
      { name: "write_order", type: AccessType.USER },
      { name: "manage_order", type: AccessType.ADMIN },
      { name: "cancel_order", type: AccessType.ADMIN },
    ],
  },
  {
    group: "Category",
    rules: [
      { name: "read_category", type: AccessType.USER },
      { name: "write_category", type: AccessType.SUPER_ADMIN },
      { name: "delete_category", type: AccessType.SUPER_ADMIN },
    ],
  },
  {
    group: "Analytics",
    rules: [
      { name: "view_analytics", type: AccessType.ADMIN },
      { name: "export_analytics", type: AccessType.SUPER_ADMIN },
    ],
  },
  // Payment related rules
  {
    group: "Payment Method",
    rules: [
      { name: "read_payment_method", type: AccessType.USER },
      { name: "write_payment_method", type: AccessType.USER },
      { name: "delete_payment_method", type: AccessType.USER },
      { name: "manage_payment_methods", type: AccessType.ADMIN },
    ],
  },
  {
    group: "Chappa Payment",
    rules: [
      { name: "read_chappa_payment", type: AccessType.USER },
      { name: "initiate_chappa_payment", type: AccessType.USER },
      { name: "verify_chappa_payment", type: AccessType.USER },
      { name: "manage_chappa_payments", type: AccessType.ADMIN },
      { name: "refund_chappa_payment", type: AccessType.SUPER_ADMIN },
    ],
  },
  // Cart and favorites
  {
    group: "Cart",
    rules: [
      { name: "read_cart", type: AccessType.USER },
      { name: "write_cart", type: AccessType.USER },
      { name: "delete_cart", type: AccessType.USER },
    ],
  },
  {
    group: "Favorite",
    rules: [
      { name: "read_favorite", type: AccessType.USER },
      { name: "write_favorite", type: AccessType.USER },
      { name: "delete_favorite", type: AccessType.USER },
    ],
  },
  // User profile and settings
  {
    group: "User Profile",
    rules: [
      { name: "read_user_profile", type: AccessType.USER },
      { name: "write_user_profile", type: AccessType.USER },
      { name: "manage_user_profiles", type: AccessType.ADMIN },
    ],
  },
  {
    group: "App Setting",
    rules: [
      { name: "read_app_setting", type: AccessType.USER },
      { name: "write_app_setting", type: AccessType.USER },
      { name: "manage_app_settings", type: AccessType.ADMIN },
    ],
  },
  // Address management
  {
    group: "Address",
    rules: [
      { name: "read_address", type: AccessType.USER },
      { name: "write_address", type: AccessType.USER },
      { name: "delete_address", type: AccessType.USER },
      { name: "manage_addresses", type: AccessType.ADMIN },
    ],
  },
  // Notifications
  {
    group: "Notification",
    rules: [
      { name: "read_notification", type: AccessType.USER },
      { name: "mark_notification_read", type: AccessType.USER },
      { name: "delete_notification", type: AccessType.USER },
      { name: "send_notification", type: AccessType.ADMIN },
      { name: "manage_notifications", type: AccessType.SUPER_ADMIN },
    ],
  },
  // Search and history
  {
    group: "Search History",
    rules: [
      { name: "read_search_history", type: AccessType.USER },
      { name: "delete_search_history", type: AccessType.USER },
      { name: "manage_search_history", type: AccessType.ADMIN },
    ],
  },
  // Order tracking
  {
    group: "Order Tracking",
    rules: [
      { name: "read_order_tracking", type: AccessType.USER },
      { name: "update_order_tracking", type: AccessType.ADMIN },
      { name: "manage_order_tracking", type: AccessType.SUPER_ADMIN },
    ],
  },
  // Product images
  {
    group: "Product Image",
    rules: [
      { name: "read_product_image", type: AccessType.USER },
      { name: "write_product_image", type: AccessType.ADMIN },
      { name: "delete_product_image", type: AccessType.ADMIN },
    ],
  },
  {
    group: "Promo Code",
    rules: [
      { name: "read_promo_code", type: AccessType.USER },
      { name: "write_promo_code", type: AccessType.ADMIN },
      { name: "delete_promo_code", type: AccessType.ADMIN },
    ],
  },
  {
    group: "Banner",
    rules: [
      { name: "read_banner", type: AccessType.USER },
      { name: "write_banner", type: AccessType.ADMIN },
      { name: "delete_banner", type: AccessType.ADMIN },
      { name: "create_banner", type: AccessType.ADMIN },
    ],
  },
];

export default { env, constants, access_rules };
