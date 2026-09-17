import { Global, Module } from '@nestjs/common';
import { InMemoryDbService } from './in-memory-db.service.js';
import { PrismaService } from './prisma.service.js';

@Global()
@Module({
  providers: [InMemoryDbService, PrismaService],
  exports: [InMemoryDbService, PrismaService],
})
export class DatabaseModule {}

