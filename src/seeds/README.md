# Database Seed Files

This directory contains seed scripts for populating the database with initial data for development and testing.

## Structure

- `index.ts` - Main seed runner that orchestrates all seed files
- `system.seed.ts` - Seeds System models (Config, File, Notification)
- `user.seed.ts` - Seeds User models (Role, AccessRule, User, UserProfile, ActionLog)
- `marketplace.seed.ts` - Seeds MarketPlace models (all B2B marketplace models)

## Running Seeds

### Run all seeds:
```bash
npm run seed
```

Or directly with tsx:
```bash
tsx src/seeds/index.ts
```

## Seed Data Overview

### System Models
- **Config**: Site configuration settings
- **File**: Default file entries
- **Notification**: Welcome notifications for users

### User Models
- **AccessRule**: 10+ access rules for different permissions
- **Role**: 4 roles (Super Admin, Admin, Buyer, Supplier)
- **User**: 6 users (1 Super Admin, 1 Admin, 2 Buyers, 2 Suppliers)
  - Default password for all users: `password123`
- **UserProfile**: Profiles for all users
- **ActionLog**: Sample action logs

### MarketPlace Models
- **Category**: 5 main categories (Agriculture, Food & Beverage, etc.)
- **Subcategory**: 6 subcategories (Coffee, Sesame, Pulses, Spices, Fruits, Processed Foods)
- **Supplier**: 2 verified suppliers linked to supplier users
- **Product**: 6 products (Coffee, Sesame, Chickpeas, Ginger, Avocado, Frankincense)
- **ProductImage**: Images for all products
- **ProductSpecification**: Specifications for products
- **ProductIncoterm**: Incoterms (EXW, FOB, CIF) for products
- **ProductTargetMarket**: Target markets for products
- **ProductUseCase**: Use cases for products
- **Cart**: Carts for buyer users
- **CartItem**: Sample cart items
- **QuoteRequest**: Sample quote requests (both authenticated and guest)
- **BlogPost**: 3 blog posts
- **NewsletterSubscription**: Sample newsletter subscriptions
- **RecentlyViewed**: Recently viewed products for users
- **ProductView**: Product view tracking data
- **Address**: Billing and shipping addresses for buyers

## Notes

- Seeds run in dependency order to respect foreign key constraints
- Uses `findOrCreate` to avoid duplicates on re-runs
- All passwords are hashed using bcrypt
- Default password for all seeded users: `password123`
