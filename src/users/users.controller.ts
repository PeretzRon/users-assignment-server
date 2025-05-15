import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { UsersService } from './users.service';
import { Routes } from '../shared/constants/routes.const';
import { CreateUserDto } from '../shared/dtos/users/create-user.dto';
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

  @Post()
  @UsePipes(new ValidationPipe())
  async create(@Body() body: CreateUserDto) {
    this.logger.log(`Creating a new user: ${JSON.stringify(body)}`);
    try {
      const result = await this.service.create(body);
      this.logger.log(`user created successfully, result: ${JSON.stringify(result)}`);
      return result;
    } catch (error) {
      this.logger.error('Error creating user', error.stack);
      throw new HttpException('Failed to create user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
