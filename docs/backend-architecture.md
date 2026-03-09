# Backend Architecture - OctoCAT Supply Chain Management API

## Overview

The OctoCAT Supply Chain Management backend is a TypeScript-based REST API built with Express.js and SQLite, designed to manage suppliers, products, orders, and deliveries in a supply chain management system.

## Technology Stack

### Core Technologies
- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js 4.21.2
- **Database**: SQLite with better-sqlite3 driver
- **Documentation**: Swagger/OpenAPI 3.0
- **Testing**: Vitest with coverage support
- **Process Manager**: tsx for development

### Key Dependencies
```json
{
  "better-sqlite3": "^12.4.1",     // SQLite database driver
  "express": "^4.21.2",           // Web framework
  "cors": "^2.8.5",               // CORS middleware
  "swagger-jsdoc": "^6.2.8",      // API documentation
  "swagger-ui-express": "^5.0.1"  // Swagger UI hosting
}
```

## Architecture Patterns

### Repository Pattern
The application follows the Repository pattern for data access, providing a clean separation between business logic and data persistence:

```
Controller Layer (Routes) → Repository Layer → Database Layer
```

### Error Handling
Centralized error handling with custom error types:
- `DatabaseError` - Base database error class
- `NotFoundError` - 404 errors for missing resources
- `ValidationError` - 400 errors for invalid data
- `ConflictError` - 409 errors for constraint violations

## Project Structure

```
api/
├── src/
│   ├── index.ts                 # Application entry point & server setup
│   ├── init-db.ts              # Database initialization & migration runner
│   ├── seedData.ts             # Database seeding utilities
│   │
│   ├── db/                     # Database configuration & utilities
│   │   ├── config.ts           # Database configuration settings
│   │   ├── migrate.ts          # Migration runner
│   │   ├── seed.ts             # Seeding logic
│   │   └── sqlite.ts           # SQLite connection management
│   │
│   ├── models/                 # TypeScript interfaces with Swagger docs
│   │   ├── supplier.ts         # Supplier entity definition
│   │   ├── product.ts          # Product entity definition
│   │   ├── order.ts            # Order entity definition
│   │   ├── delivery.ts         # Delivery entity definition
│   │   └── ...                 # Other domain models
│   │
│   ├── repositories/           # Data access layer
│   │   ├── suppliersRepo.ts    # Supplier data operations
│   │   ├── productsRepo.ts     # Product data operations
│   │   ├── ordersRepo.ts       # Order data operations
│   │   └── ...                 # Other repository implementations
│   │
│   ├── routes/                 # API endpoints & controllers
│   │   ├── supplier.ts         # Supplier CRUD endpoints
│   │   ├── product.ts          # Product CRUD endpoints
│   │   ├── order.ts            # Order management endpoints
│   │   └── ...                 # Other route handlers
│   │
│   └── utils/                  # Shared utilities
│       ├── errors.ts           # Error handling & custom exceptions
│       └── sql.ts              # SQL query building utilities
│
├── sql/                        # Database schema & data
│   ├── migrations/             # Database schema migrations
│   │   ├── 001_init.sql        # Initial schema creation
│   │   └── 002_add_supplier_status_fields.sql
│   └── seed/                   # Sample data for development
│       ├── 001_suppliers.sql
│       ├── 002_headquarters.sql
│       └── ...
│
├── data/                       # SQLite database files (gitignored)
├── api-swagger.json           # Generated OpenAPI specification
├── package.json               # Dependencies & scripts
├── tsconfig.json             # TypeScript configuration
└── vitest.config.ts          # Testing configuration
```

## Database Design

### Schema Overview
The application uses SQLite with the following core entities:

#### Core Entities
1. **Suppliers** - External vendors providing products
2. **Headquarters** - Main office locations
3. **Branches** - Regional offices (linked to headquarters)
4. **Products** - Items supplied by vendors
5. **Orders** - Purchase orders from branches to suppliers
6. **Order Details** - Line items within orders
7. **Deliveries** - Shipment information
8. **Order Detail Deliveries** - Delivery tracking for specific order items

#### Key Relationships
```sql
Headquarters (1) ← → (N) Branches
Suppliers (1) ← → (N) Products
Branches (1) ← → (N) Orders
Orders (1) ← → (N) Order Details
Products (1) ← → (N) Order Details
Deliveries (1) ← → (N) Order Detail Deliveries
Order Details (1) ← → (N) Order Detail Deliveries
```

### Database Configuration
```typescript
// Default configuration in src/db/config.ts
export const DB_CONFIG = {
  DB_FILE: process.env.DB_FILE || './data/app.db',
  DB_ENGINE: 'sqlite',
  ENABLE_WAL: true,              // Write-Ahead Logging for concurrency
  TIMEOUT: 30000,                // 30 second timeout
  FOREIGN_KEYS: true,            // Enforce referential integrity
};
```

### Migration System
- **Location**: `sql/migrations/`
- **Format**: Sequentially numbered SQL files (`001_*.sql`)
- **Execution**: Automatic on server startup via `init-db.ts`
- **Tracking**: Migration state tracked in `schema_migrations` table

## API Design

### REST Endpoints
The API follows RESTful conventions with consistent URL patterns:

```
GET    /api/{entity}           # List all resources
POST   /api/{entity}           # Create new resource
GET    /api/{entity}/{id}      # Get specific resource
PUT    /api/{entity}/{id}      # Update specific resource
DELETE /api/{entity}/{id}      # Delete specific resource
```

### Available Endpoints
- `/api/suppliers` - Supplier management
- `/api/products` - Product catalog
- `/api/headquarters` - Company headquarters
- `/api/branches` - Branch offices
- `/api/orders` - Purchase orders
- `/api/order-details` - Order line items
- `/api/deliveries` - Shipment tracking
- `/api/order-detail-deliveries` - Detailed delivery information

### Response Format
Standard JSON responses with consistent error handling:

```typescript
// Success Response
{
  "data": { ... },
  "status": "success"
}

// Error Response
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Supplier with ID 123 not found"
  }
}
```

### HTTP Status Codes
- `200` - Success (GET, PUT)
- `201` - Created (POST)
- `204` - No Content (DELETE)
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `409` - Conflict (constraint violations)
- `500` - Internal Server Error

## API Documentation

### Swagger/OpenAPI Integration
- **Interactive Documentation**: Available at `/api-docs`
- **JSON Specification**: Available at `/api-docs.json`
- **Inline Documentation**: JSDoc comments in model and route files
- **Auto-Generation**: Swagger specification built from source code annotations

### Example Model Documentation
```typescript
/**
 * @swagger
 * components:
 *   schemas:
 *     Supplier:
 *       type: object
 *       required:
 *         - supplierId
 *         - name
 *       properties:
 *         supplierId:
 *           type: integer
 *           description: The unique identifier for the supplier
 *         name:
 *           type: string
 *           description: The name of the supplier
 */
export interface Supplier {
  supplierId: number;
  name: string;
  // ... other properties
}
```

## Development Workflow

### Available Scripts
```bash
# Development
npm run dev              # Start development server with hot reload
npm run build           # Compile TypeScript to JavaScript
npm run start           # Start production server

# Database Management
npm run db:init         # Initialize database and run migrations + seeding
npm run db:migrate      # Run migrations only
npm run db:seed         # Run seeding only

# Code Quality
npm run test            # Run test suite
npm run test:coverage   # Run tests with coverage report
npm run lint            # Check code style
npm run lint:fix        # Fix code style issues
```

### Environment Variables
```bash
# Server Configuration
PORT=3000                    # Server port (default: 3000)
NODE_ENV=development        # Environment mode

# Database Configuration
DB_FILE=./data/app.db       # SQLite database file path
DB_ENABLE_WAL=true          # Enable Write-Ahead Logging
DB_TIMEOUT=30000            # Connection timeout (ms)
DB_FOREIGN_KEYS=true        # Enforce foreign key constraints

# CORS Configuration
API_CORS_ORIGINS=http://localhost:5137,https://example.com
```

## Security Considerations

### CORS Configuration
- **Development**: Allows localhost origins and common development ports
- **Production**: Configurable via `API_CORS_ORIGINS` environment variable
- **Cloud Support**: Auto-detects GitHub Codespaces and Azure Container Apps

### Database Security
- **SQL Injection Prevention**: Parameterized queries throughout
- **Foreign Key Constraints**: Enforced at database level
- **Transaction Safety**: Proper error handling and rollback

### Input Validation
- **Type Safety**: TypeScript interfaces for all data models
- **Runtime Validation**: Custom validation in repository layer
- **Error Sanitization**: Consistent error messages without sensitive data exposure

## Testing Strategy

### Test Structure
```
├── src/
│   ├── repositories/
│   │   └── suppliersRepo.test.ts    # Repository unit tests
│   └── routes/
│       └── branch.test.ts           # Route integration tests
```

### Testing Tools
- **Test Runner**: Vitest for fast TypeScript testing
- **HTTP Testing**: Supertest for API endpoint testing
- **Coverage**: V8 coverage reports
- **In-Memory Database**: `:memory:` SQLite for isolated tests

### Test Categories
1. **Unit Tests**: Repository methods and utility functions
2. **Integration Tests**: API endpoints with real database operations
3. **Coverage Reports**: Ensure comprehensive test coverage

## Performance Considerations

### Database Optimizations
- **WAL Mode**: Enabled for better concurrent access
- **Connection Pooling**: Single connection with proper lifecycle management
- **Prepared Statements**: better-sqlite3 provides automatic statement preparation
- **Indexing**: Primary keys and foreign keys automatically indexed

### Application Optimizations
- **Lazy Loading**: Database connection established on first use
- **Error Caching**: Consistent error handling prevents resource leaks
- **TypeScript Compilation**: Build step for production optimization

## Deployment

### Containerization
```dockerfile
# Multi-stage build in api/Dockerfile
FROM node:18-alpine AS build
# ... build steps

FROM node:18-alpine AS runtime
# ... runtime configuration
```

### Database Persistence
- **Development**: File-based SQLite in `./data/app.db`
- **Production**: Configurable via `DB_FILE` environment variable
- **Container**: Mount persistent volume for database files

### Environment Support
- **Local Development**: Direct Node.js execution
- **GitHub Codespaces**: Auto-detection and port forwarding
- **Azure Container Apps**: Environment-based configuration
- **Docker**: Full containerization support

## Monitoring & Maintenance

### Logging
- **Startup Logging**: Database initialization and server startup status
- **Error Logging**: Comprehensive error information without sensitive data
- **CORS Logging**: Configured origins logged on startup

### Health Checks
- **Basic Health**: Root endpoint (`/`) provides simple health check
- **Database Health**: Automatic database initialization with error handling
- **API Documentation**: Always available for endpoint testing

### Maintenance Tasks
- **Database Migrations**: Automatic on server startup
- **Seeding**: Intelligent seeding (only when needed)
- **Log Monitoring**: Structured logging for production monitoring

---

## Documentation Notes

### DeliveriesRepository (2026-03-02)

Full TSDoc was added to `api/src/repositories/deliveriesRepo.ts` — see generated output at
`api/generated/custom-agent-docs-expert/deliveriesRepo.20260302-143000.documented.ts`.

**Known model/Swagger schema mismatch:** The `@swagger` block in `api/src/models/delivery.ts`
documents fields `orderId`, `scheduledDate`, `actualDeliveryDate`, and `notes`, but the
`Delivery` TypeScript interface actually exposes `supplierId`, `deliveryDate`, `name`,
`description`, and `status`. The Swagger schema should be updated to match the interface,
or the interface expanded, before new route documentation is written for the delivery
specialised query methods (`findBySupplierId`, `findByStatus`, `findByDateRange`).
Those three repository methods currently have no corresponding REST endpoints.

---

For more detailed information about specific components, see:
- [Database Schema Details](./sqlite-integration.md)
- [Overall Architecture](./architecture.md)
- [Deployment Guide](./deployment.md)