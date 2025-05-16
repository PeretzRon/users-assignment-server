import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { UsersService } from './users.service';
import { Routes } from '../shared/constants/routes.const';
import { CreateUserDto } from '../shared/dtos/users/create-user.dto';
import { DeleteUserDto } from '../shared/dtos/users/delete-user.dto';
import { UserResponseDto } from '../shared/dtos/users/user-response.dto';

@ApiTags('Users')
@Controller({
  version: '1',
  path: Routes.USERS,
})
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly service: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Fetch all users' })
  @ApiResponse({
    status: 200,
    description: 'List of all users',
    type: UserResponseDto,
    isArray: true,
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to fetch users',
  })
  async getAll(): Promise<{ users: UserResponseDto[] }> {
    this.logger.log('Fetching all users');
    try {
      const users = await this.service.getAll();
      this.logger.log('users fetched successfully');
      return { users };
    } catch (error) {
      this.logger.error('Error fetching users', error.stack);
      throw new HttpException('Failed to fetch users', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    type: UserResponseDto,
    description: 'User created successfully',
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to create user',
  })
  async create(@Body() body: CreateUserDto): Promise<UserResponseDto> {
    this.logger.log(`Creating a new user: ${JSON.stringify((({ password: _password, ...rest }) => rest)(body))}`);
    try {
      const result = await this.service.create(body);
      this.logger.log(`user created successfully, result: ${JSON.stringify(result)}`);
      return result;
    } catch (error) {
      this.logger.error('Error creating user', error.stack);
      throw new HttpException(
        `Failed to create user: ${error.message}`,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':uuid')
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Delete a user by UUID' })
  @ApiParam({
    name: 'uuid',
    description: 'UUID of the user to delete',
  })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to delete user',
  })
  async delete(@Param() params: DeleteUserDto) {
    this.logger.log(`Start deleting user with id: ${params.uuid}`);
    try {
      const result = await this.service.delete(params.uuid);
      this.logger.log(`User with id: ${params.uuid} deleted successfully`);
      return { deleted: result };
    } catch (error) {
      this.logger.error(`Error deleting user with id: ${params.uuid}`, error.stack);
      throw new HttpException(
        `Failed to delete user: ${error.message}`,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
