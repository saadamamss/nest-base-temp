# NestJS Base Project

A production-ready NestJS starter template for new projects.

## Features

- **Authentication**: JWT with access & refresh tokens
- **Database**: Prisma ORM with PostgreSQL
- **Validation**: class-validator & class-transformer
- **API Documentation**: Swagger/OpenAPI
- **Logging**: Winston logger
- **Error Handling**: Global exception filter
- **CORS**: Configurable CORS origins
- **Rate Limiting**: Throttler guard
- **Health Checks**: Terminus health endpoint
- **File Upload**: Multer integration

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL (or use Neon, Supabase, etc.)

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
├── auth/           # Authentication module
├── config/         # Configuration module
├── common/         # Shared decorators, guards, filters, interceptors
├── health/         # Health check endpoints
├── mail/           # Email service
├── prisma/         # Prisma service
├── upload/         # File upload module
└── users/          # User management module
```

## API Documentation

Once running, visit: `http://localhost:3000/api/docs`

## Available Scripts

- `npm run start` - Start the application
- `npm run start:dev` - Start with hot reload
- `npm run build` - Build for production
- `npm run lint` - Lint and fix code
- `npm run test` - Run tests

## License

UNLICENSED
