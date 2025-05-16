import * as bcrypt from 'bcrypt';
import { Injectable, NotFoundException } from '@nestjs/common';

import { UsersRepository } from './users.repository';
import { RetryService } from '../retry/retry.service';
import { QueueService } from '../queue/queue.service';
import { CreateUserDto } from '../shared/dtos/users/create-user.dto';
import { UserResponseDto } from '../shared/dtos/users/user-response.dto';

@Injectable()
export class UsersService {
  private readonly RETRIES = 3;

  private readonly DELAY_MS = 500;

  constructor(
    private readonly repo: UsersRepository,
    private readonly retryService: RetryService,
    private readonly queueService: QueueService,
  ) {}

  async getAll(): Promise<UserResponseDto[]> {
    return this.retryService.retry(() => this.repo.getAll(), 5);
  }

  async create(user: CreateUserDto): Promise<UserResponseDto> {
    const hashedPassword = await bcrypt.hash(user.password, 10);

    const newUser = {
      ...user,
      password: hashedPassword,
    };

    const createUserResult = await this.retryService.retry(
      () => this.repo.create(newUser),
      this.RETRIES,
      this.DELAY_MS,
      async (error) => {
        await this.queueService.enqueueFailedJob('create-user', {
          user: newUser,
          reason: error instanceof Error ? error.message : String(error),
        });
      },
    );

    delete createUserResult.password;
    return createUserResult;
  }

  async delete(uuid: string): Promise<boolean> {
    const isDeleted = await this.retryService.retry(
      async () => this.repo.delete(uuid),
      this.RETRIES,
      this.DELAY_MS,
      async (error) => {
        await this.queueService.enqueueFailedJob('delete-user', {
          uuid,
          reason: error,
        });
      },
    );
    if (!isDeleted) {
      throw new NotFoundException('User not found');
    }

    return isDeleted;
  }
}
