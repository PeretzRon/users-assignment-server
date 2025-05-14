import { Injectable } from '@nestjs/common';
import { HealthIndicatorResult } from '@nestjs/terminus';

import { DbService } from '../db/db.service';

@Injectable()
export class MongoHealthIndicator {
  constructor(private readonly db: DbService) {}

  async check(key = 'mongo', timeoutMs = 1000): Promise<HealthIndicatorResult> {
    try {
      await Promise.race([this.db.getDatabase().command({ ping: 1 }), this.timeout(timeoutMs)]);
      return {
        [key]: {
          status: 'up',
        },
      };
    } catch (error) {
      return {
        [key]: {
          status: 'down',
          message: error.message,
        },
      };
    }
  }

  private timeout(ms: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Mongo ping timed out'));
      }, ms);
    });
  }
}
