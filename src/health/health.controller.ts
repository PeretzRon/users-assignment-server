import { HealthCheck } from '@nestjs/terminus';
import { Controller, Get } from '@nestjs/common';

import { MongoHealthIndicator } from './mongo.health';
import { Routes } from '../shared/constants/routes.const';

@Controller()
export class HealthController {
  constructor(private mongoIndicator: MongoHealthIndicator) {}

  @Get(Routes.HEALTH)
  @HealthCheck()
  async check() {
    const mongoStatus = await this.mongoIndicator.check();
    const all = { ...mongoStatus };
    const isHealthy = Object.values(all).every((s: any) => s.status === 'up');
    return { isHealthy, ...all };
  }
}
