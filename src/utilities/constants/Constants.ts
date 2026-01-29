import { Model } from "sequelize";
import { AccessRule, ActionLog, Role, User, UserProfile } from "../../models/User";

import { File, Notification } from "../../models/System";
import { BlogPost, ProductSpecification, ProductIncoterm, ProductUseCase, ProductView, ProductTargetMarket, QuoteRequest, RecentlyViewed, Subcategory, NewsletterSubscription, Supplier, Address, Cart, CartItem, Category, Product, ProductImage } from "../../models/MarketPlace";

// Define the user type for better type safety
export interface FacebookUserProfile {
  id: string;
  displayName: string;
  emails: { value: string }[];
}

export const Currency = {
  AED: "د.إ", // United Arab Emirates Dirham
  AFN: "؋", // Afghan Afghani
  ALL: "L", // Albanian Lek
  AMD: "֏", // Armenian Dram
  ANG: "ƒ", // Netherlands Antillean Guilder
  AOA: "Kz", // Angolan Kwanza
  ARS: "$", // Argentine Peso
  AUD: "$", // Australian Dollar
  AWG: "ƒ", // Aruban Florin
  AZN: "₼", // Azerbaijani Manat
  BAM: "KM", // Bosnia-Herzegovina Convertible Mark
  BBD: "$", // Barbadian Dollar
  BDT: "৳", // Bangladeshi Taka
  BGN: "лв", // Bulgarian Lev
  BHD: ".د.ب", // Bahraini Dinar
  BIF: "FBu", // Burundian Franc
  BMD: "$", // Bermudian Dollar
  BND: "$", // Brunei Dollar
  BOB: "Bs.", // Bolivian Boliviano
  BOV: "Mvdol", // Bolivian Mvdol
  BRL: "R$", // Brazilian Real
  BSD: "$", // Bahamian Dollar
  BTN: "Nu.", // Bhutanese Ngultrum
  BWP: "P", // Botswana Pula
  BYN: "Br", // Belarusian Ruble
  BZD: "$", // Belize Dollar
  CAD: "$", // Canadian Dollar
  CDF: "FC", // Congolese Franc
  CHE: "CHE", // WIR Euro
  CHF: "Fr.", // Swiss Franc
  CHW: "CHW", // WIR Franc
  CLF: "UF", // Chilean Unit of Account (UF)
  CLP: "$", // Chilean Peso
  CNY: "¥", // Chinese Yuan
  COP: "$", // Colombian Peso
  COU: "COU", // Unidad de Valor Real
  CRC: "₡", // Costa Rican Colón
  CUP: "₱", // Cuban Peso
  CVE: "$", // Cape Verdean Escudo
  CZK: "Kč", // Czech Koruna
  DJF: "Fdj", // Djiboutian Franc
  DKK: "kr.", // Danish Krone
  DOP: "$", // Dominican Peso
  DZD: "د.ج", // Algerian Dinar
  EGP: "£", // Egyptian Pound
  ERN: "Nfk", // Eritrean Nakfa
  ETB: "Br", // Ethiopian Birr
  EUR: "€", // Euro
  FJD: "$", // Fijian Dollar
  FKP: "£", // Falkland Islands Pound
  GBP: "£", // British Pound Sterling
  GEL: "₾", // Georgian Lari
  GHS: "₵", // Ghanaian Cedi
  GIP: "£", // Gibraltar Pound
  GMD: "D", // Gambian Dalasi
  GNF: "FG", // Guinean Franc
  GTQ: "Q", // Guatemalan Quetzal
  GYD: "$", // Guyanese Dollar
  HKD: "$", // Hong Kong Dollar
  HNL: "L", // Honduran Lempira
  HTG: "G", // Haitian Gourde
  HUF: "Ft", // Hungarian Forint
  IDR: "Rp", // Indonesian Rupiah
  ILS: "₪", // Israeli New Shekel
  INR: "₹", // Indian Rupee
  IQD: "ع.د", // Iraqi Dinar
  IRR: "﷼", // Iranian Rial
  ISK: "kr", // Icelandic Króna
  JMD: "$", // Jamaican Dollar
  JOD: "د.ا", // Jordanian Dinar
  JPY: "¥", // Japanese Yen
  KES: "KSh", // Kenyan Shilling
  KGS: "лв", // Kyrgyzstani Som
  KHR: "៛", // Cambodian Riel
  KMF: "CF", // Comorian Franc
  KPW: "₩", // North Korean Won
  KRW: "₩", // South Korean Won
  KWD: "د.ك", // Kuwaiti Dinar
  KYD: "$", // Cayman Islands Dollar
  KZT: "₸", // Kazakhstani Tenge
  LAK: "₭", // Lao Kip
  LBP: "ل.ل", // Lebanese Pound
  LKR: "Rs", // Sri Lankan Rupee
  LRD: "$", // Liberian Dollar
  LSL: "L", // Lesotho Loti
  LYD: "ل.د", // Libyan Dinar
  MAD: "د.م.", // Moroccan Dirham
  MDL: "L", // Moldovan Leu
  MGA: "Ar", // Malagasy Ariary
  MKD: "ден", // Macedonian Denar
  MMK: "K", // Myanmar Kyat
  MNT: "₮", // Mongolian Tugrik
  MOP: "MOP$", // Macanese Pataca
  MRU: "UM", // Mauritanian Ouguiya
  MUR: "₨", // Mauritian Rupee
  MVR: "ރ.", // Maldivian Rufiyaa
  MWK: "MK", // Malawian Kwacha
  MXN: "$", // Mexican Peso
  MYR: "RM", // Malaysian Ringgit
  MZN: "MT", // Mozambican Metical
  NAD: "$", // Namibian Dollar
  NGN: "₦", // Nigerian Naira
  NIO: "C$", // Nicaraguan Córdoba
  NOK: "kr", // Norwegian Krone
  NPR: "₨", // Nepalese Rupee
  NZD: "$", // New Zealand Dollar
  OMR: "ر.ع.", // Omani Rial
  PAB: "B/.", // Panamanian Balboa
  PEN: "S/.", // Peruvian Sol
  PGK: "K", // Papua New Guinean Kina
  PHP: "₱", // Philippine Peso
  PKR: "₨", // Pakistani Rupee
  PLN: "zł", // Polish Złoty
  PYG: "₲", // Paraguayan Guaraní
  QAR: "ر.ق", // Qatari Riyal
  RON: "lei", // Romanian Leu
  RSD: "дин.", // Serbian Dinar
  RUB: "₽", // Russian Ruble
  RWF: "FRw", // Rwandan Franc
  SAR: "﷼", // Saudi Riyal
  SBD: "$", // Solomon Islands Dollar
  SCR: "₨", // Seychellois Rupee
  SDG: "£", // Sudanese Pound
  SEK: "kr", // Swedish Krona
  SGD: "$", // Singapore Dollar
  SHP: "£", // Saint Helena Pound
  SLE: "Le", // Sierra Leonean Leone
  SOS: "Sh", // Somali Shilling
  SRD: "$", // Surinamese Dollar
  SSP: "£", // South Sudanese Pound
  STN: "Db", // São Tomé and Príncipe Dobra
  SVC: "$", // Salvadoran Colón
  SYP: "£", // Syrian Pound
  SZL: "L", // Swazi Lilangeni
  THB: "฿", // Thai Baht
  TJS: "ЅМ", // Tajikistani Somoni
  TMT: "T", // Turkmenistani Manat
  TND: "د.ت", // Tunisian Dinar
  TOP: "T$", // Tongan Paʻanga
  TRY: "₺", // Turkish Lira
  TTD: "$", // Trinidad and Tobago Dollar
  TWD: "NT$", // New Taiwan Dollar
  TZS: "Sh", // Tanzanian Shilling
  UAH: "₴", // Ukrainian Hryvnia
  UGX: "Sh", // Ugandan Shilling
  USD: "$", // United States Dollar
  UYU: "$U", // Uruguayan Peso
  UZS: "лв", // Uzbekistani Som
  VES: "Bs.", // Venezuelan Bolívar
  VND: "₫", // Vietnamese Dong
  VUV: "VT", // Vanuatu Vatu
  WST: "T", // Samoan Tala
  XAF: "FCFA", // Central African CFA Franc
  XCD: "$", // East Caribbean Dollar
  XOF: "CFA", // West African CFA Franc
  XPF: "₣", // CFP Franc
  YER: "﷼", // Yemeni Rial
  ZAR: "R", // South African Rand
  ZMW: "ZK", // Zambian Kwacha
  ZWL: "Z$", // Zimbabwean Dollar
};

export const GeneralStatus = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  PENDING: "Pending",
  BLOCKED: "Blocked",
  ARCHIVED: "Archived",
}

export const AccessType = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  USER: "User",
  DELIVERY: "Delivery",
};


export const UserType = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  USER: "User",
  DELIVERY: "Delivery",
};

export const UserNotificationStatus = {
  L1: "L1",
  L2: "L2",
  L3: "L3",
  L4: "L4",
  L5: "L5",
  OFF: "Off",
};

export const ConfigType = {
  BOOLEAN: "Boolean",
  INTEGER: "Integer",
  DOUBLE: "Double",
  STRING: "String",
};

export const LogActions = {
  INIT: "Init",
  CREATE: "Create",
  UPDATE: "Update",
  SOFT_DELETE: "Soft Delete",
  HARD_DELETE: "Hard Delete",
  RESTORE: "Restore",
  FAILURE: "Failure",
  FETCH: "Fetch",
};

export const LogTypes = {
  REQUEST: "Request",
  ERROR: "Error",
  ACTION: "Action",
  INFO: "Info",
};

export const UserStatus = {
  PENDING: "Pending",
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  BLOCKED: "Blocked",
  ARCHIVED: "Archived",
};

export const NotificationType = {
  INFO: "Info",
  WARNING: "Warning",
  SUCCESS: "Success",
  ALERT: "Alert",
};

export const NotificationCategory = {
  INFO: "Info",
  SUBSCRIPTION: "Subscription",
  AFFILIATE: "Affiliate",
  WARNING: "Warning",
  LISTING: "Listing",
};

export const PaymentStatus = {
  PENDING: "pending",
  COMPLETED: "completed",
  REFUNDED: "refunded",
  FAILED: "failed",
};

export const OrderStatus = {
  PROCESSING: "processing",
  PAID: "paid",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled"
}

export const EmailType = {
  PASSWORD_RECOVERY: "passwordRecovery",
  EMAIL_VERIFICATION: "verification"
}

export type EmailTypeValues = (typeof EmailType)[keyof typeof EmailType];

export const ConfigNames = {
  HEALTH_STATUS: "Health Status",
}

export const Gender = {
  MALE: "male",
  FEMALE: "female",
  OTHER: "other"
}

export const EngagementMetricsType = {
  IMPRESSION: "impression",
  VIEW: "view"
};

export const PREFERRED_CONTACT_METHOD = {
  WHATSAPP: "WhatsApp",
  EMAIL: "Email",
  PHONE_CALL: "Phone Call",
  SMS: "SMS",
  NO_PREFERENCE: "No Preference"
}

export const PaymentMethod = {
  TELE_BIRR: 'tele_birr',
  MPESA: 'mpesa',
  AMOLE: 'Amole',
  CBE_BIRR: 'CBEBirr',
  COOPAY_EBIRR: 'Coopay-Ebirr',
  AWASH_BIRR: 'AwashBirr',
  OTHER: 'other'
};

export const BannerTargetAudience = {
  ALL: 'ALL',
  GUEST: 'GUEST',
  REGISTERED: 'REGISTERED'
};

export const PasswordMessage =
  "Password must be at least 8 and at most 16 characters and must contain at least one lower case, one upper case, one special character and one number";
export const PasswordRegex =
  /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[^\\w\\s]).{8,16}$/;
export const PhoneNumberRegex = /^\+[1-9]\d{1,14}$/;
export const EmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const LatitudeValueRegex = /^(\+|-)?(90(\.0+)?|[1-8]?\d(\.\d+)?)$/;
export const LongtudeValueRegex =
  /^(\+|-)?(180(\.0+)?|1?[0-7]?\d(\.\d+)?|\d{1,2}(\.\d+)?)$/;
export const WebsiteUrlRegex =
  /^https:\/\/(www\.)?[a-zA-Z][a-zA-Z0-9-]*[a-zA-Z0-9]\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})*([/?#][\w-.~!*'();:@&=+$,/?%#[\]]*)*$/;
  

const ModelType: Map<string, typeof Model> = new Map<string, typeof Model>();

ModelType.set("file", File);
ModelType.set("role", Role);
ModelType.set("user", User);
ModelType.set("access-rule", AccessRule);
ModelType.set("action-log", ActionLog);
ModelType.set("notification", Notification);
ModelType.set("user_profile", UserProfile);

ModelType.set("cart", Cart);
ModelType.set("cart_item", CartItem);
ModelType.set("address", Address);
ModelType.set("category", Category);
ModelType.set("product", Product);
ModelType.set("product_image", ProductImage);
ModelType.set("product_incoterm", ProductIncoterm);
ModelType.set("product_specification", ProductSpecification);
ModelType.set("product_target_market", ProductTargetMarket);
ModelType.set("product_use_case", ProductUseCase);
ModelType.set("product_view", ProductView);
ModelType.set("quote_request", QuoteRequest);
ModelType.set("recently_viewed", RecentlyViewed);
ModelType.set("subcategory", Subcategory);
ModelType.set("supplier", Supplier);
ModelType.set("newsletter_subscription", NewsletterSubscription);
ModelType.set("blog_post", BlogPost);

export { ModelType };

export enum AdminApproval {
  PENDING = "Pending",
  REJECTED = "Rejected",
  APPROVED = "Approved"
}