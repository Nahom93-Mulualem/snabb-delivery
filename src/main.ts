import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const logger = new Logger('SnabbBootstrap');
  const app = await NestFactory.create(AppModule);

  // Security Headers via Helmet
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: false, // Allow Swagger docs and rich UI CDN assets
    }),
  );

  // Global Prefix
  app.setGlobalPrefix('api');

  // Dynamic CORS Configuration from ALLOWED_ORIGINS or development defaults
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
    : [
        'http://localhost:3000',
        'http://localhost:3456',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3456',
      ];

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(null, allowedOrigins.includes(origin));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // Global DTO Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // OpenAPI / Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('Snabb On-Demand Delivery API')
    .setDescription(
      'Modular, production-ready backend API powering the Customer, Restaurant Merchant, Courier Driver, and Platform Super-Admin ecosystems.',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('Authentication & Role Gateways')
    .addTag('Restaurants & Merchant Stores')
    .addTag('Menu & Product Catalog')
    .addTag('Orders & Live Dispatch Pipeline')
    .addTag('Couriers & Fleet Dispatch')
    .addTag('Reviews & Ratings')
    .addTag('Promotions & Vouchers')
    .addTag('Platform Super-Admin')
    .addTag('Support Tickets & Dispute Desk')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port);

  logger.log(`🚀 Snabb NestJS Server active at: http://localhost:${port}/api`);
  logger.log(`📚 Interactive Swagger OpenAPI Docs at: http://localhost:${port}/api/docs`);
}

await bootstrap();
