import { Module } from '@nestjs/common';
import { CouriersService } from './couriers.service.js';
import { CouriersController } from './couriers.controller.js';

@Module({
  controllers: [CouriersController],
  providers: [CouriersService],
  exports: [CouriersService],
})
export class CouriersModule {}
