import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { DatabaseModule } from './database/database.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { RestaurantsModule } from './modules/restaurants/restaurants.module.js';
import { MenuModule } from './modules/menu/menu.module.js';
import { OrdersModule } from './modules/orders/orders.module.js';
import { CouriersModule } from './modules/couriers/couriers.module.js';
import { ReviewsModule } from './modules/reviews/reviews.module.js';
import { PromotionsModule } from './modules/promotions/promotions.module.js';
import { AdminModule } from './modules/admin/admin.module.js';
import { SupportModule } from './modules/support/support.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    AuthModule,
    RestaurantsModule,
    MenuModule,
    OrdersModule,
    CouriersModule,
    ReviewsModule,
    PromotionsModule,
    AdminModule,
    SupportModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
