# Red-Sea API

## Overview
Red-Sea API is a comprehensive marketplace platform built with Node.js, Express, and TypeScript. The API provides a robust foundation for building e-commerce applications with features for product management, order processing, user authentication, and more.

## Core Features
- User authentication and authorization with role-based access control
- Product catalog management with categories and search
- Order processing and management
- Admin dashboard with analytics
- File uploads and management
- Notification system

## Technical Stack
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with PostGIS extension for location-based features
- **Authentication**: JWT-based authentication
- **Documentation**: Swagger/OpenAPI
- **Containerization**: Docker

## Getting Started

### Prerequisites
- Node.js 18 or higher
- PostgreSQL database
- Docker (optional)

### Installation

1. Clone the repository
```bash
git clone https://github.com/NatnaeAssefa/read-sea-backend.git
cd red-sea-backend
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env` file in the root directory with the following variables:
```
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=redsea
DB_USER=postgres
DB_PASS=yourpassword

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRY=24h

# Email
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
```

4. Initialize the database
```bash
# Create PostGIS extension
CREATE EXTENSION postgis;

# Create spatial index
CREATE INDEX idx_location_geography ON address USING GIST(location);
```

5. Start the development server
```bash
npm run dev
```

## API Documentation
The API documentation is available at `/api-docs` when the server is running. It provides detailed information about all available endpoints, request/response formats, and authentication requirements.

## Docker Deployment
The application can be deployed using Docker:

```bash
# Build and start containers
docker-compose up -d
```

## Project Structure
```
red-sea-api/
├── src/
│   ├── app.ts                 # Application entry point
│   ├── config/                # Configuration files
│   ├── controllers/           # Request handlers
│   ├── dals/                  # Data Access Layers
│   ├── middleware/            # Express middleware
│   ├── models/                # Database models
│   ├── routes/                # API routes
│   ├── services/              # Business logic
│   ├── utilities/             # Utility functions
│   └── Swagger/               # API documentation
├── views/                     # Email templates
├── public/                    # Static files
├── uploads/                   # File uploads
├── logs/                      # Application logs
├── docker-compose.yml         # Docker configuration
├── Dockerfile                 # Docker build file
└── package.json               # Project dependencies
```

## Marketplace Module
The marketplace module extends the core API with e-commerce functionality:

### Models
- **Product**: Manages product information including name, description, price, stock, and images
- **Category**: Hierarchical product categorization
- **Order**: Tracks customer orders with status and payment information
- **OrderItem**: Individual items within an order

### Features
- **Product Management**: CRUD operations for products with support for images
- **Category Management**: Hierarchical category structure
- **Order Processing**: Complete order lifecycle from creation to fulfillment
- **User Roles**: Separate buyer and seller experiences
- **Admin Dashboard**: Sales analytics and platform management

## Authentication & Authorization
The API uses JWT-based authentication with role-based access control:

- **Authentication**: Login, registration, password reset
- **Authorization**: Fine-grained permissions based on user roles
- **Access Rules**: Configurable access rules for different user types

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
