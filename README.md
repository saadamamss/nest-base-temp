# NestJS Base Project

A production-ready NestJS starter template for new projects.

## Features

- **Authentication**: JWT with access & refresh tokens (httpOnly cookie)
- **Database**: Prisma ORM with PostgreSQL
- **Validation**: class-validator & class-transformer with custom error messages
- **API Documentation**: Swagger/OpenAPI (dev only)
- **Logging**: Winston logger (console + file output, JSON format in production)
- **Error Handling**: Global exception filter
- **CORS**: Configurable CORS origins
- **Rate Limiting**: Throttler guard (100 req/min)
- **Health Checks**: Terminus health endpoint with database check
- **File Upload**: Multer integration with disk storage
- **Caching**: Redis with ioredis + @nestjs/cache-manager
- **Security**: Helmet.js headers
- **Cookies**: Cookie-parser support with httpOnly cookies
- **Email**: Nodemailer integration (welcome, forgot/reset password, email verification)
- **RBAC**: Role-based access control (USER, ADMIN, MODERATOR)
- **Public Endpoints**: @Public decorator to bypass auth
- **Current User**: @CurrentUser decorator to get authenticated user
- **Standardized Responses**: Global response interceptor
- **Pagination**: Built-in pagination helper with Prisma skip/take
- **Request Logging**: Logging middleware with request ID (X-Request-Id header)
- **API Versioning**: Global prefix `api/v1`
- **Static Files**: Serve uploaded files from `/uploads` route
- **Account Security**: Account locking after 5 failed login attempts (30 min lock)
- **Token Revocation**: tokenVersion-based refresh token revocation on logout/password reset

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL
- Redis (optional, for caching)

### Installation

```bash
npm install
```

### Configuration

1. Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

2. Update the environment variables in `.env`

3. Run Prisma migrations:

```bash
npx prisma migrate dev
```

### Running the App

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## Project Structure

```
src/
├── auth/           # Authentication module (JWT, guards, strategies)
├── config/         # Configuration module
├── common/         # Shared decorators, guards, filters, interceptors, helpers
├── health/         # Health check endpoints
├── mail/           # Email service
├── prisma/         # Prisma service
├── redis/          # Redis caching service
├── upload/         # File upload module
└── users/          # User management module
```

## API Documentation

Once running, visit: `http://localhost:3000/docs`

## Environment Variables

See `.env.example` for the full list of environment variables.

## Available Scripts

- `npm run start` - Start the application
- `npm run start:dev` - Start with hot reload
- `npm run start:debug` - Start with debugging
- `npm run start:prod` - Start production (after build)
- `npm run build` - Build for production
- `npm run lint` - Lint and fix code
- `npm run format` - Format code with Prettier
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:cov` - Run tests with coverage
- `npm run test:e2e` - Run e2e tests

## License

UNLICENSED
