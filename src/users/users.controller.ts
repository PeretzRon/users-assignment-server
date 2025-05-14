import { Controller, Get, HttpException, HttpStatus, Logger } from '@nestjs/common';

import { UsersService } from './users.service';
import { Routes } from '../shared/constants/routes.const';
import { UserResponseDto } from '../shared/dtos/users/user-response.dto';

@Controller({
  version: '1',
  path: Routes.USERS,
})
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly service: UsersService) {}

  @Get()
  async getAll(): Promise<UserResponseDto[]> {
    this.logger.log('Fetching all users');
    try {
      const users = await this.service.getAll();
      this.logger.log('users fetched successfully');
      return users;
    } catch (error) {
      this.logger.error('Error fetching users', error.stack);
      throw new HttpException('Failed to fetch users', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
