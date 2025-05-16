import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import config from './config';
import { UsersModule } from './users/users.module';
import { QueueModule } from './queue/queue.module';
import { RetryService } from './retry/retry.service';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [config],
    }),
    HealthModule,
    UsersModule,
    QueueModule,
  ],
  controllers: [],
  providers: [RetryService],
  exports: [RetryService],
})
export class AppModule {}
