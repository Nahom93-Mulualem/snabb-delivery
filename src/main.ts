import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const logger = new Logger('SnabbBootstrap');
  const app = await NestFactory.create(AppModule);

  // Global Prefix
  app.setGlobalPrefix('api');

  // CORS Configuration for Next.js and static web clients
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3456',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3456',
    ],
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
