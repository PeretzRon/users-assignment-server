import Redis from 'ioredis';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HealthIndicatorResult } from '@nestjs/terminus';

@Injectable()
export class RedisHealthIndicator {
  private client: Redis;

  constructor(private readonly configService: ConfigService) {
    this.client = new Redis({
      host: configService.get<string>('REDIS_HOST'),
      port: configService.get<number>('REDIS_PORT'),
    });
  }

  async check(key = 'redis', timeoutMs = 1000): Promise<HealthIndicatorResult> {
    try {
      const timeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Redis ping timeout')), timeoutMs);
      });
      const ping = this.client.ping();
      await Promise.race([ping, timeout]);

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
}
