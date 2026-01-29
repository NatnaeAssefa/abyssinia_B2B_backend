export const superAdminAccessRules = [
  // Global
  "access_paranoid",
  
  // Access Log
  "read_action_log",
  "write_action_log",
  "delete_action_log",
  
  // Config
  "read_config",
  "write_config",
  "delete_config",
  
  // File
  "read_file",
  "write_file",
  "delete_file",
  
  // Access Rule
  "read_access_rule",
  "write_access_rule",
  "delete_access_rule",
  
  // Role
  "read_role",
  "write_role",
  "delete_role",
  
  // User
  "read_user",
  "revoke_user_token",
  "change_user_password",
  "write_user",
  "delete_user",
  
  // Product
  "read_product",
  "write_product",
  "delete_product",
  "approve_product",
  
  // Order
  "read_order",
  "write_order",
  "manage_order",
  "cancel_order",
  "delete_order",
  
  // Category
  "read_category",
  "write_category",
  "delete_category",
  
  // Analytics
  "view_analytics",
  "export_analytics",
  
  // Payment Method
  "read_payment_method",
  "write_payment_method",
  "delete_payment_method",
  "manage_payment_methods",
  
  // Chappa Payment
  "read_chappa_payment",
  "initiate_chappa_payment",
  "verify_chappa_payment",
  "manage_chappa_payments",
  "refund_chappa_payment",
  
  // Cart
  "read_cart",
  "write_cart",
  "delete_cart",
  
  // Favorite
  "read_favorite",
  "write_favorite",
  "delete_favorite",
  
  // User Profile
  "read_user_profile",
  "write_user_profile",
  "manage_user_profiles",
  
  // App Setting
  "read_app_setting",
  "write_app_setting",
  "manage_app_settings",
  
  // Address
  "read_address",
  "write_address",
  "delete_address",
  "manage_addresses",
  
  // Notification
  "read_notification",
  "mark_notification_read",
  "delete_notification",
  "send_notification",
  "manage_notifications",
  
  // Search History
  "read_search_history",
  "delete_search_history",
  "manage_search_history",
  
  // Order Tracking
  "read_order_tracking",
  "update_order_tracking",
  "manage_order_tracking",
  
  // Product Image
  "read_product_image",
  "write_product_image",
  "delete_product_image",

  // Promo Code
  "read_promo_code",
  "write_promo_code",
  "delete_promo_code",
];

export default superAdminAccessRules;