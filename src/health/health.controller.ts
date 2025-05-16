import { HealthCheck } from '@nestjs/terminus';
import { Controller, Get } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

import { MongoHealthIndicator } from './mongo.health';
import { RedisHealthIndicator } from './redis.health';
import { Routes } from '../shared/constants/routes.const';

@Controller()
export class HealthController {
  constructor(
    private mongoIndicator: MongoHealthIndicator,
    private redisIndicator: RedisHealthIndicator,
  ) {}

  @ApiExcludeEndpoint()
  @Get(Routes.HEALTH)
  @HealthCheck()
  async check() {
    const mongoStatus = await this.mongoIndicator.check();
    const redisStatus = await this.redisIndicator.check();
    const all = { ...mongoStatus, ...redisStatus };
    const isHealthy = Object.values(all).every((s: any) => s.status === 'up');
    return { isHealthy, ...all };
  }
}
