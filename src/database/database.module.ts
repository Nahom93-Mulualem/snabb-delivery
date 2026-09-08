import { Global, Module } from '@nestjs/common';
import { InMemoryDbService } from './in-memory-db.service.js';

@Global()
@Module({
  providers: [InMemoryDbService],
  exports: [InMemoryDbService],
})
export class DatabaseModule {}
