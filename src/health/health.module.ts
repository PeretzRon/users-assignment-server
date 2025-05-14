import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TerminusModule } from '@nestjs/terminus';

import { DbModule } from '../db/db.module';
import { MongoHealthIndicator } from './mongo.health';
import { HealthController } from './health.controller';

@Module({
  controllers: [HealthController],
  imports: [TerminusModule, HttpModule, DbModule],
  providers: [MongoHealthIndicator],
})
export class HealthModule {}
