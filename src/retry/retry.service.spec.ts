import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { RetryService } from './retry.service';
import { QueueService } from '../queue/queue.service';

describe('RetryService', () => {
  let retryService: RetryService;
  let queueService: QueueService;

  beforeEach(async () => {
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RetryService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'RETRY_COUNT') return 3;
              if (key === 'RETRY_DELAY_MS') return 100;
              return undefined;
            }),
          },
        },
        {
          provide: QueueService,
          useValue: {
            enqueueFailedJob: jest.fn(),
          },
        },
      ],
    }).compile();

    retryService = module.get<RetryService>(RetryService);
    queueService = module.get<QueueService>(QueueService);
  });

  it('should succeed on the first try', async () => {
    const fn = jest.fn().mockResolvedValue('success');

    const result = await retryService.retry(fn);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(result).toBe('success');
  });

  it('should retry and eventually succeed', async () => {
    const fn = jest
      .fn()
      .mockRejectedValueOnce(new Error('fail 1'))
      .mockRejectedValueOnce(new Error('fail 2'))
      .mockResolvedValue('success');

    const result = await retryService.retry(fn);

    expect(fn).toHaveBeenCalledTimes(3);
    expect(result).toBe('success');
  });

  it('should fail after maximum retries', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('always fails'));

    await expect(retryService.retry(fn, 2, 10)).rejects.toThrow('always fails');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should timeout if the function takes too long', async () => {
    const fn = jest.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve('late'), 200);
        }),
    );

    await expect(retryService.retry(fn, 1, 10, undefined, 50)).rejects.toThrow('Operation timed out');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should call onMaxAttempts if all retries fail', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('boom'));
    const onMax = jest.fn();

    await expect(retryService.retry(fn, 2, 10, onMax)).rejects.toThrow('boom');

    expect(fn).toHaveBeenCalledTimes(2);
    expect(onMax).toHaveBeenCalledWith(expect.any(Error));
  });
});
