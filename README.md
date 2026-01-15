# Hono.js Boilerplate

A production-ready, feature-rich Hono.js boilerplate with modern best practices, authentication, PostgreSQL, Redis caching, and payment gateway integration.

## 🚀 Features

- ✅ **JWT Authentication** - Secure token-based authentication with refresh tokens
- ✅ **PostgreSQL + Prisma** - Type-safe database ORM with migrations
- ✅ **Database Seeder** - Seed data for development and testing
- ✅ **Image Upload** - File upload with validation and storage management
- ✅ **User Profile** - Complete CRUD operations for user profiles
- ✅ **Order Management** - Order creation, tracking, and status management
- ✅ **Doku Payment Gateway** - Integrated payment processing
- ✅ **Redis Caching** - Performance optimization with Redis
- ✅ **Swagger Documentation** - Interactive API documentation at `/api/docs`
- ✅ **Rate Limiting** - API rate limiting for security
- ✅ **Structured Logging** - Winston logger with multiple transports
- ✅ **Error Handling** - Centralized error handling
- ✅ **Input Validation** - Request validation with Zod
- ✅ **TypeScript** - Full type safety throughout
- ✅ **Docker Support** - Complete containerization for deployment

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- npm or yarn or pnpm

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd honojs-boilerplate
```

### 2. Install dependencies

```bash
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

# Database Configuration
DATABASE_URL="postgresql://user:password@localhost:5432/honojs_db"

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key

# Doku Payment Gateway
DOKU_CLIENT_ID=your_doku_client_id
DOKU_SECRET_KEY=your_doku_secret_key
DOKU_ENVIRONMENT=sandbox
```

### 4. Setup database

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database (optional)
npm run prisma:seed
```

### 5. Start the server

```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
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
│   ├── migrations/              # Database migrations
│   └── seed.ts                # Database seeder
├── src/
│   ├── config/                 # Configuration files
│   │   ├── database.ts         # Database connection
│   │   ├── redis.ts            # Redis connection
│   │   ├── jwt.ts              # JWT configuration
│   │   ├── upload.ts           # Upload configuration
│   │   └── doku.ts            # Doku payment config
│   ├── middleware/             # HTTP middleware
│   │   ├── index.ts            # Middleware registry
│   │   ├── error.middleware.ts   # Error handling
│   │   ├── auth.middleware.ts    # JWT authentication
│   │   ├── validation.middleware.ts # Request validation
│   │   ├── rate-limit.middleware.ts # Rate limiting
│   │   └── logger.middleware.ts  # Request logging
│   ├── modules/                # Feature modules
│   │   ├── auth/              # Authentication module
│   │   ├── user/              # User management
│   │   ├── upload/            # File upload
│   │   ├── order/             # Order management
│   │   ├── payment/           # Payment processing
│   │   └── profile/           # Profile management
│   ├── infrastructure/          # External integrations
│   │   ├── cache/             # Redis service
│   │   └── storage/           # File storage
│   ├── utils/                 # Utility functions
│   │   ├── logger.ts           # Winston logger
│   │   ├── crypto.ts           # Cryptography utilities
│   │   ├── file.ts            # File utilities
│   │   └── response.ts        # Response helpers
│   ├── types/                 # TypeScript types
│   └── validators/            # Zod schemas
├── tests/                    # Test files
│   ├── unit/                  # Unit tests
│   └── integration/           # Integration tests
├── uploads/                  # Upload directory
├── package.json
├── tsconfig.json
├── docker-compose.yml
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
DELETE /api/users/me             # Delete current user account
GET    /api/users/:id            # Get user by ID (admin)
```

### Upload

```
POST   /api/upload/image         # Upload single image
POST   /api/upload/images        # Upload multiple images
DELETE /api/upload/:id           # Delete uploaded file
```

### Profile

```
GET    /api/profile              # Get user profile
PUT    /api/profile              # Update user profile
PATCH  /api/profile/avatar       # Update avatar
```

### Orders

```
GET    /api/orders               # List user orders
POST   /api/orders               # Create new order
GET    /api/orders/:id            # Get order details
PUT    /api/orders/:id           # Update order
DELETE /api/orders/:id           # Cancel order
GET    /api/orders/:id/items     # Get order items
```

### Payment

```
POST   /api/payment/initiate     # Initiate payment
POST   /api/payment/callback     # Payment callback (webhook)
GET    /api/payment/:id/status    # Get payment status
POST   /api/payment/verify       # Verify payment
```

### Health & Utility

```
GET    /health                   # Health check
GET    /api/docs                 # Swagger documentation
GET    /api/version              # API version
```

## 🧪 Testing

### Run tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm test -- --watch
```

### Test structure

```bash
tests/
├── unit/              # Unit tests for services and utilities
│   ├── auth.service.test.ts
│   ├── user.service.test.ts
│   └── ...
└── integration/       # Integration tests for API endpoints
    ├── auth.test.ts
    ├── user.test.ts
    └── ...
```

## 📝 Code Quality

### Linting

```bash
# Run ESLint
npm run lint

# Fix linting issues
npm run lint:fix
```

### Formatting

```bash
# Format code with Prettier
npm run format

# Check formatting
npm run format:check
```

## 🔧 Development Tools

### Prisma Studio

```bash
npm run prisma:studio
```

Open Prisma Studio to interact with your database visually.

### Database Migrations

```bash
# Create a new migration
npx prisma migrate dev --name <migration-name>

# Reset database (development only)
npx prisma migrate reset

# Generate Prisma Client
npx prisma generate
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

### Deployment Checklist

- [ ] Set all environment variables
- [ ] Configure production database
- [ ] Configure Redis
- [ ] Set secure JWT_SECRET
- [ ] Configure Doku production credentials
- [ ] Set up SSL/TLS certificates
- [ ] Configure CORS origins
- [ ] Set up monitoring and logging
- [ ] Configure backups
- [ ] Set up auto-scaling (if needed)

## 🔒 Security

### Security Features

- JWT token authentication with refresh tokens
- Password hashing with bcrypt
- Rate limiting on all endpoints
- Input validation with Zod
- CORS configuration
- File upload validation
- Payment signature verification
- SQL injection prevention (Prisma)
- XSS prevention

### Security Best Practices

1. **Never commit `.env` file** - Use `.env.example` as template
2. **Use strong JWT secrets** - Generate secure random secrets
3. **Enable HTTPS** - Always use HTTPS in production
4. **Validate all inputs** - Use Zod schemas
5. **Implement rate limiting** - Prevent abuse
6. **Sanitize file uploads** - Validate type, size, content
7. **Regular updates** - Keep dependencies updated
8. **Monitor logs** - Track security events

## 📊 Performance

### Caching Strategy

| Data Type | Cache Duration | Invalidation Strategy |
|-----------|----------------|---------------------|
| User Profile | 1 hour | On profile update |
| Order Details | 30 minutes | On order update |
| Product List | 5 minutes | Scheduled |
| API Responses | 1-15 minutes | Time-based |

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
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 👥 Authors

- Kilo Code - Initial work

## 🙏 Acknowledgments

- [Hono.js](https://hono.dev/) - Web framework
- [Prisma](https://www.prisma.io/) - Database ORM
- [Redis](https://redis.io/) - Caching
- [Doku](https://developer.doku.com/) - Payment gateway

## 📞 Support

For support, email support@honojs-boilerplate.com or open an issue on GitHub.

---

**Built with ❤️ using Hono.js**
