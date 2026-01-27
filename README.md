# Hono.js Boilerplate

A production-ready, feature-rich Hono.js boilerplate with modern best practices, authentication, PostgreSQL, Redis caching, and payment gateway integration.

## 🚀 Features

- ✅ **JWT Authentication** - Secure token-based authentication with refresh tokens
- ✅ **PostgreSQL + Prisma** - Type-safe database ORM with migrations
- ✅ **Database Seeder** - Seed data for development and testing
- ✅ **User Profile** - Complete CRUD operations for user profiles
- ✅ **Order Management** - Order creation, tracking, and status management
- ✅ **Doku Payment Gateway** - Integrated payment processing
- ✅ **Redis Caching** - Performance optimization with Redis
- ✅ **Rate Limiting** - API rate limiting for security
- ✅ **Structured Logging** - Winston logger with multiple transports
- ✅ **Error Handling** - Centralized error handling
- ✅ **Input Validation** - Request validation with Zod
- ✅ **Input Sanitization** - XSS prevention and input cleaning
- ✅ **Security Headers** - Comprehensive security middleware
- ✅ **TypeScript** - Full type safety throughout
- ✅ **Docker Support** - Complete containerization for deployment

## 📋 Prerequisites

- Bun 1.0+
- PostgreSQL 15+
- Redis 7+
- npm, yarn, pnpm, or bun(recommend)

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd honojs-starter
```

### 2. Install dependencies

```bash
bun install
# or
npm install
# or
yarn install
# or
pnpm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Server Configuration
NODE_ENV=development
PORT=3000
API_VERSION=v1

# Database Configuration
DATABASE_URL="postgresql://user:password@localhost:5432/honojs_db"

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_ACCESS_TOKEN_EXPIRY=15m
JWT_REFRESH_TOKEN_EXPIRY=7d

# Doku Payment Gateway Configuration
DOKU_CLIENT_ID=your_doku_client_id
DOKU_SECRET_KEY=your_doku_secret_key
DOKU_ENVIRONMENT=sandbox
DOKU_WEBHOOK_SECRET=your_webhook_secret

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Rate Limiting Configuration
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging Configuration
LOG_LEVEL=info
LOG_FORMAT=json
```

### 4. Setup database

```bash
# Generate Prisma Client
bun run db:generate

# Run migrations
bun run db:migration

# Seed database (optional)
bun run db:seeding
```

### 5. Start the server

```bash
# Development mode
bun run dev

# Production mode
bun run build
bun start
```

## 🐳 Docker Deployment

### Using Docker Compose

```bash
# Start all services
docker-compose up -d

# Start with admin tools (pgAdmin, Redis Commander)
docker-compose --profile admin up -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down
```

### Using Dockerfile

```bash
# Build image
docker build -t honojs-boilerplate .

# Run container
docker run -p 3000:3000 --env-file .env honojs-boilerplate
```

## 📁 Project Structure

```
honojs/
├── prisma/                    # Database schema and migrations
│   ├── schema.prisma           # Database schema
│   ├── prisma.config.ts        # Prisma configuration
│   ├── seeding-service.ts      # Database seeder
│   └── seeder/                # Seed data modules
│       ├── user.seeder.ts
│       ├── profile.seeder.ts
│       ├── order.seeder.ts
│       └── order-item.seeder.ts
├── src/
│   ├── index.ts               # Application entry point
│   ├── config/                # Configuration files
│   │   ├── env.ts            # Environment configuration
│   │   └── env.config.ts     # Environment validation
│   ├── middleware/            # HTTP middleware
│   │   ├── index.ts           # Middleware registry
│   │   ├── auth.middleware.ts    # JWT authentication
│   │   ├── error.middleware.ts   # Error handling
│   │   ├── validation.middleware.ts # Request validation
│   │   ├── rate-limit.middleware.ts # Rate limiting
│   │   ├── logger.middleware.ts  # Request logging
│   │   ├── security.middleware.ts # Security headers
│   │   ├── sanitize.middleware.ts # Input sanitization
│   │   └── cache.middleware.ts    # Response caching
│   ├── modules/               # Feature modules
│   │   ├── auth/              # Authentication module
│   │   │   ├── auth.router.ts
│   │   │   ├── auth.handler.ts
│   │   │   ├── auth.service.ts
│   │   │   └── auth.interface.ts
│   │   ├── user/              # User management
│   │   │   ├── user.router.ts
│   │   │   ├── user.handler.ts
│   │   │   ├── user.service.ts
│   │   │   └── user.interface.ts
│   │   ├── profile/           # Profile management
│   │   │   ├── profile.router.ts
│   │   │   ├── profile.handler.ts
│   │   │   ├── profile.service.ts
│   │   │   └── profile.interface.ts
│   │   ├── order/             # Order management
│   │   │   ├── order.router.ts
│   │   │   ├── order.handler.ts
│   │   │   ├── order.service.ts
│   │   │   └── order.interface.ts
│   │   └── payment/           # Payment processing
│   │       ├── payment.router.ts
│   │       ├── payment.handler.ts
│   │       ├── payment.service.ts
│   │       └── payment.interface.ts
│   ├── infrastructure/        # External integrations
│   │   ├── cache/
│   │   │   └── cache.service.ts   # Redis service
│   │   └── database/
│   │       └── database.service.ts # Prisma client
│   ├── utils/                # Utility functions
│   │   ├── logger.ts          # Winston logger
│   │   ├── crypto.ts          # Cryptography utilities
│   │   ├── response.ts        # Response helpers
│   │   └── env-validator.ts   # Environment validation
│   └── validators/           # Zod schemas
│       ├── auth.validator.ts
│       ├── user.validator.ts
│       ├── profile.validator.ts
│       ├── order.validator.ts
│       ├── payment.validator.ts
│       └── upload.validator.ts
├── tests/                    # Test files
│   ├── unit/                  # Unit tests
│   │   └── middleware/
│   │       ├── rate-limit.middleware.test.ts
│   │       ├── sanitize.middleware.test.ts
│   │       ├── security.middleware.test.ts
│   │       └── validation.middleware.test.ts
│   └── example.test.ts
├── docs/                     # Documentation
├── .env.example               # Environment template
├── .gitignore
├── .eslintrc.json
├── .prettierrc
├── .dockerignore
├── docker-compose.yml
├── Dockerfile
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

## 🔌 API Endpoints

### Authentication

```
POST   /api/auth/register        # Register new user
POST   /api/auth/login           # User login
POST   /api/auth/logout          # User logout
POST   /api/auth/refresh         # Refresh access token
POST   /api/auth/verify-email    # Verify email address
POST   /api/auth/forgot-password # Request password reset
POST   /api/auth/reset-password  # Reset password
```

### User Management

```
GET    /api/users/me             # Get current user profile
PUT    /api/users/me             # Update current user profile
PUT    /api/users/me/password     # Update user password
DELETE /api/users/me             # Delete current user account
PATCH  /api/users/me/deactivate  # Deactivate user account
PATCH  /api/users/me/activate   # Activate user account
```

### Profile

```
GET    /api/profile              # Get user profile
POST   /api/profile              # Create user profile
PUT    /api/profile              # Update user profile
DELETE /api/profile              # Delete user profile
```

### Orders

```
GET    /api/orders               # List user orders
POST   /api/orders               # Create new order
GET    /api/orders/:id            # Get order details
PUT    /api/orders/:id           # Update order
POST   /api/orders/:id/cancel    # Cancel order
DELETE /api/orders/:id           # Delete order
```

### Payment

```
POST   /api/payment/initiate     # Initiate payment
POST   /api/payment/callback     # Payment callback (webhook)
GET    /api/payment/:id/status    # Get payment status
POST   /api/payment/verify       # Verify payment
POST   /api/payment/refund       # Refund payment
GET    /api/payment/statistics   # Get payment statistics
```

### Health & Utility

```
GET    /health                   # Health check
GET    /api/version              # API version
```

## 🧪 Testing

### Run tests

```bash
# Run all tests
bun test

# Run tests with coverage
bun run test:coverage

# Run tests in watch mode
bun test -- --watch
```

### Test structure

```bash
tests/
├── unit/              # Unit tests for services and utilities
│   └── middleware/
│       ├── rate-limit.middleware.test.ts
│       ├── sanitize.middleware.test.ts
│       ├── security.middleware.test.ts
│       └── validation.middleware.test.ts
└── example.test.ts   # Example test
```

## 📝 Code Quality

### Linting

```bash
# Run ESLint
bun run lint

# Fix linting issues
bun run lint:fix
```

### Formatting

```bash
# Format code with Prettier
bun run format

# Check formatting
bun run format:check
```

## 🔧 Development Tools

### Prisma Studio

```bash
bun run db:studio
```

Open Prisma Studio to interact with your database visually.

### Database Migrations

```bash
# Create a new migration
npx prisma migrate dev --name <migration-name>

# Reset database (development only)
npx prisma migrate reset

# Generate Prisma Client
bun run db:generate
```

## 🚢 Deployment

### Environment Variables

Required environment variables for production:

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=<your-database-url>
REDIS_HOST=<redis-host>
REDIS_PORT=6379
JWT_SECRET=<secure-jwt-secret>
DOKU_CLIENT_ID=<your-client-id>
DOKU_SECRET_KEY=<your-secret-key>
DOKU_ENVIRONMENT=production
ALLOWED_ORIGINS=https://yourdomain.com
```

## 🔒 Security

### Security Features

- JWT token authentication with refresh tokens
- Password hashing with bcrypt
- Rate limiting on all endpoints
- Input validation with Zod
- Input sanitization (XSS prevention)
- CORS configuration
- Payment signature verification
- SQL injection prevention (Prisma)
- Comprehensive security headers

### Security Best Practices

1. **Never commit `.env` file** - Use `.env.example` as template
2. **Use strong JWT secrets** - Generate secure random secrets
3. **Enable HTTPS** - Always use HTTPS in production
4. **Validate all inputs** - Use Zod schemas
5. **Implement rate limiting** - Prevent abuse
6. **Sanitize all inputs** - Use sanitization middleware
7. **Regular updates** - Keep dependencies updated
8. **Monitor logs** - Track security events

## 📊 Performance

### Caching Strategy

| Data Type    | Cache Duration | Invalidation Strategy |
| ------------ | -------------- | --------------------- |
| User Profile | 1 hour         | On profile update     |
| Profile Data | 1 hour         | On profile update     |
| Order List   | 30 minutes     | On order update       |
| Payment Data | 30 minutes     | On payment update     |

### Optimization Tips

1. **Use Redis caching** - Cache frequently accessed data
2. **Database indexes** - Add indexes to frequently queried fields
3. **Connection pooling** - Configure Prisma connection pool
4. **Pagination** - Implement pagination for large datasets
5. **Compression** - Enable gzip/brotli compression
6. **CDN** - Use CDN for static assets

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 👥 Authors

- Ganonym741 - Initial work

## 🙏 Acknowledgments

- [Hono.js](https://hono.dev/) - Web framework
- [Prisma](https://www.prisma.io/) - Database ORM
- [Redis](https://redis.io/) - Caching
- [Doku](https://developer.doku.com/) - Payment gateway

---

**Built with ❤️ using Hono.js**
