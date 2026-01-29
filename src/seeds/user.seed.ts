import bcrypt from "bcrypt";
import { Role, AccessRule, User, UserProfile, ActionLog } from "../models/User";
import { File } from "../models/System";
import { AccessType, UserType, UserStatus } from "../utilities/constants/Constants";
import { seedNotification } from "./system.seed";
import LogService from "../services/Log/Log.service";

export const seedUser = async () => {
  try {
    LogService.LogInfo("Seeding User models...");

    // Seed AccessRule first
    await seedAccessRule();
    
    // Seed Role (depends on AccessRule)
    await seedRole();
    
    // Seed User (depends on Role)
    await seedUserData();
    
    // Seed UserProfile (depends on User and File)
    await seedUserProfile();
    
    // Seed ActionLog
    await seedActionLog();
    
    LogService.LogInfo("User models seeded successfully");
  } catch (error: any) {
    LogService.LogError(`User seed error: ${error.message}`);
    throw error;
  }
};

const seedAccessRule = async () => {
  const accessRules = [
    {
      name: "user.create",
      description: "Create new users",
      group: "User Management",
      type: AccessType.ADMIN,
    },
    {
      name: "user.read",
      description: "View users",
      group: "User Management",
      type: AccessType.USER,
    },
    {
      name: "user.update",
      description: "Update users",
      group: "User Management",
      type: AccessType.ADMIN,
    },
    {
      name: "user.delete",
      description: "Delete users",
      group: "User Management",
      type: AccessType.SUPER_ADMIN,
    },
    {
      name: "product.create",
      description: "Create products",
      group: "Product Management",
      type: AccessType.USER,
    },
    {
      name: "product.read",
      description: "View products",
      group: "Product Management",
      type: AccessType.USER,
    },
    {
      name: "product.update",
      description: "Update products",
      group: "Product Management",
      type: AccessType.USER,
    },
    {
      name: "product.delete",
      description: "Delete products",
      group: "Product Management",
      type: AccessType.ADMIN,
    },
    {
      name: "order.create",
      description: "Create orders",
      group: "Order Management",
      type: AccessType.USER,
    },
    {
      name: "order.read",
      description: "View orders",
      group: "Order Management",
      type: AccessType.USER,
    },
  ];

  for (const rule of accessRules) {
    await AccessRule.findOrCreate({
      where: { name: rule.name },
      defaults: rule,
    });
  }
  LogService.LogInfo(`Seeded ${accessRules.length} access rules`);
};

const seedRole = async () => {
  const roles = [
    {
      name: "Super Admin",
      description: "Full system access",
      access_rules: JSON.stringify([
        "user.create",
        "user.read",
        "user.update",
        "user.delete",
        "product.create",
        "product.read",
        "product.update",
        "product.delete",
        "order.create",
        "order.read",
      ]),
      type: AccessType.SUPER_ADMIN,
    },
    {
      name: "Admin",
      description: "Administrative access",
      access_rules: JSON.stringify([
        "user.create",
        "user.read",
        "user.update",
        "product.create",
        "product.read",
        "product.update",
        "product.delete",
        "order.create",
        "order.read",
      ]),
      type: AccessType.ADMIN,
    },
    {
      name: "Buyer",
      description: "Buyer role for purchasing products",
      access_rules: JSON.stringify([
        "product.read",
        "order.create",
        "order.read",
      ]),
      type: AccessType.USER,
    },
    {
      name: "Supplier",
      description: "Supplier role for managing products",
      access_rules: JSON.stringify([
        "product.create",
        "product.read",
        "product.update",
        "order.read",
      ]),
      type: AccessType.USER,
    },
  ];

  for (const role of roles) {
    await Role.findOrCreate({
      where: { name: role.name },
      defaults: role,
    });
  }
  LogService.LogInfo(`Seeded ${roles.length} roles`);
};

const seedUserData = async () => {
  const hashedPassword = await bcrypt.hash("password123", 10);
  const lastUsedKey = await bcrypt.genSalt(10);

  // Get roles
  const superAdminRole = await Role.findOne({ where: { name: "Super Admin" } });
  const adminRole = await Role.findOne({ where: { name: "Admin" } });
  const buyerRole = await Role.findOne({ where: { name: "Buyer" } });
  const supplierRole = await Role.findOne({ where: { name: "Supplier" } });

  const users = [
    {
      email: "superadmin@abyssinab2b.com",
      password: hashedPassword,
      first_name: "Super",
      last_name: "Admin",
      phone_number: "+251911000001",
      status: UserStatus.ACTIVE,
      type: UserType.SUPER_ADMIN,
      role_id: superAdminRole?.id,
      is_verified: true,
      last_used_key: lastUsedKey,
      pref_language: "EN",
      pref_currency: "USD",
      pref_unit: "m",
    },
    {
      email: "admin@abyssinab2b.com",
      password: hashedPassword,
      first_name: "Admin",
      last_name: "User",
      phone_number: "+251911000002",
      status: UserStatus.ACTIVE,
      type: UserType.ADMIN,
      role_id: adminRole?.id,
      is_verified: true,
      last_used_key: lastUsedKey,
      pref_language: "EN",
      pref_currency: "USD",
      pref_unit: "m",
    },
    {
      email: "buyer1@abyssinab2b.com",
      password: hashedPassword,
      first_name: "John",
      last_name: "Buyer",
      phone_number: "+251911000003",
      status: UserStatus.ACTIVE,
      type: UserType.USER,
      role_id: buyerRole?.id,
      is_verified: true,
      last_used_key: lastUsedKey,
      pref_language: "EN",
      pref_currency: "USD",
      pref_unit: "m",
    },
    {
      email: "buyer2@abyssinab2b.com",
      password: hashedPassword,
      first_name: "Jane",
      last_name: "Smith",
      phone_number: "+251911000004",
      status: UserStatus.ACTIVE,
      type: UserType.USER,
      role_id: buyerRole?.id,
      is_verified: true,
      last_used_key: lastUsedKey,
      pref_language: "EN",
      pref_currency: "EUR",
      pref_unit: "kg",
    },
    {
      email: "supplier1@abyssinab2b.com",
      password: hashedPassword,
      first_name: "Ahmed",
      last_name: "Supplier",
      phone_number: "+251911000005",
      status: UserStatus.ACTIVE,
      type: UserType.USER,
      role_id: supplierRole?.id,
      is_verified: true,
      last_used_key: lastUsedKey,
      pref_language: "EN",
      pref_currency: "USD",
      pref_unit: "m",
    },
    {
      email: "supplier2@abyssinab2b.com",
      password: hashedPassword,
      first_name: "Maria",
      last_name: "Exporter",
      phone_number: "+251911000006",
      status: UserStatus.ACTIVE,
      type: UserType.USER,
      role_id: supplierRole?.id,
      is_verified: true,
      last_used_key: lastUsedKey,
      pref_language: "EN",
      pref_currency: "USD",
      pref_unit: "m",
    },
  ];

  const createdUsers = [];
  for (const user of users) {
    const [createdUser] = await User.findOrCreate({
      where: { email: user.email },
      defaults: user,
    });
    createdUsers.push(createdUser);
    
    // Create notifications for each user
    await seedNotification(createdUser.id);
  }
  LogService.LogInfo(`Seeded ${users.length} users`);
  return createdUsers;
};

const seedUserProfile = async () => {
  const defaultFile = await File.findOne({ where: { name: "default-avatar.png" } });
  
  const users = await User.findAll();
  
  for (const user of users) {
    await UserProfile.findOrCreate({
      where: { user_id: user.id },
      defaults: {
        user_id: user.id,
        file_id: defaultFile?.id || null,
        bio: `Profile for ${user.first_name} ${user.last_name}`,
        website_url: null,
        social_media_links: [],
        address: "Addis Ababa, Ethiopia",
        city: "Addis Ababa",
        country: "Ethiopia",
        date_of_birth: null,
        gender: null,
        time_zone: "Africa/Addis_Ababa",
        preferred_contact_method: "email",
        is_active: true,
        last_activity_time: new Date(),
      },
    });
  }
  LogService.LogInfo(`Seeded ${users.length} user profiles`);
};

const seedActionLog = async () => {
  const users = await User.findAll({ limit: 3 });
  
  const actionLogs = [
    {
      action: "Create",
      object: "User",
      description: "User account created",
      prev_data: {},
      new_data: { email: users[0]?.email || "test@example.com" },
      user_id: users[0]?.id || null,
    },
    {
      action: "Update",
      object: "User",
      description: "User profile updated",
      prev_data: { status: "Pending" },
      new_data: { status: "Active" },
      user_id: users[1]?.id || null,
    },
    {
      action: "Create",
      object: "Product",
      description: "New product created",
      prev_data: {},
      new_data: { name: "Sample Product" },
      user_id: users[2]?.id || null,
    },
  ];

  for (const log of actionLogs) {
    if (log.user_id) {
      await ActionLog.create(log);
    }
  }
  LogService.LogInfo(`Seeded ${actionLogs.length} action logs`);
};
