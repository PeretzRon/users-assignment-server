import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';

import { UsersRepository } from './users.repository';
import { CreateUserDto } from '../shared/dtos/users/create-user.dto';
import { UserResponseDto } from '../shared/dtos/users/user-response.dto';

@Injectable()
export class UsersService {
  constructor(private readonly repo: UsersRepository) {}

  getAll(): Promise<UserResponseDto[]> {
    return this.repo.getAll();
  }

  async create(user: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const newUser = await this.repo.create({
      ...user,
      password: hashedPassword,
    });
    delete newUser.password;
    return newUser;
  }
}
