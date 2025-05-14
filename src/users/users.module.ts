import { Module } from '@nestjs/common';

import { DbModule } from '../db/db.module';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { RetryService } from '../retry/retry.service';

@Module({
  imports: [DbModule],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, RetryService],
})
export class UsersModule {}
