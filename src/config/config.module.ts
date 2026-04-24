// src/config/config.module.ts
import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        PORT: Joi.number().default(3000),
        DATABASE_URL: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRES_IN: Joi.string().default('15m'),
        JWT_REFRESH_SECRET: Joi.string().required(),
        JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
        CORS_ORIGINS: Joi.string().default('http://localhost:3000'),
        MAIL_HOST: Joi.string().required(),
        MAIL_PORT: Joi.number().default(587),
        MAIL_USER: Joi.string().allow('').optional(),
        MAIL_PASS: Joi.string().allow('').optional(),
        MAIL_FROM: Joi.string().required(),
        APP_URL: Joi.string().default('http://localhost:3000'),
        FRONTEND_URL: Joi.string().default('http://localhost:5173'),
        REDIS_HOST: Joi.string().default('localhost'),
        REDIS_PORT: Joi.number().default(6379),
        REDIS_USERNAME: Joi.string().default('default'),
        REDIS_PASSWORD: Joi.string().allow('').optional(),
        REDIS_TLS: Joi.string().valid('true', 'false').default('false'),
      }),
    }),
  ],
})
export class AppConfigModule {}
