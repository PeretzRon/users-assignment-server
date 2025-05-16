import { Queue } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';

@Injectable()
export class QueueService {
  constructor(@InjectQueue('retry-failures') private queue: Queue) {}

  async enqueueFailedJob(operation: string, data: Record<string, any>) {
    await this.queue.add('failed-operation', { operation, ...data });
  }
}
