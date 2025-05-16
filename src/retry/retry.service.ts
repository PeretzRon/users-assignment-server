import { ConfigService } from '@nestjs/config';
import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';

import { QueueService } from '../queue/queue.service';

@Injectable()
export class RetryService {
  private readonly logger = new Logger(RetryService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly queueService: QueueService,
  ) {}

  async retry<T>(
    fn: () => Promise<T>,
    customRetries?: number,
    customDelayMs?: number,
    onMaxAttempts?: (error: unknown) => void | Promise<void>,
  ): Promise<T> {
    const retries = customRetries ?? this.configService.get<number>('RETRY_COUNT')!;
    const delayMs = customDelayMs ?? this.configService.get<number>('RETRY_DELAY_MS')!;
    return this.tryWithRetry(fn, retries, delayMs, 1, onMaxAttempts);
  }

  private async tryWithRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number,
    delayMs: number,
    attempt: number,
    onMaxAttempts?: (error: unknown) => void | Promise<void>,
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Attempt ${attempt}/${maxRetries} failed: ${message}`);

      if (attempt >= maxRetries) {
        this.logger.error('All retry attempts failed.');

        if (onMaxAttempts) {
          await onMaxAttempts(error);
        }

        throw error;
      }

      await this.delay(delayMs);
      return this.tryWithRetry(fn, maxRetries, delayMs, attempt + 1, onMaxAttempts);
    }
  }

  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  private async timeoutPromise(ms: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Operation timed out after ${ms}ms`));
      }, ms);
    });
  }
}
