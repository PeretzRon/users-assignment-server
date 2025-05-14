import { Injectable } from '@nestjs/common';

import { UsersRepository } from './users.repository';
import { UserResponseDto } from '../shared/dtos/users/user-response.dto';

@Injectable()
export class UsersService {
  constructor(private readonly repo: UsersRepository) {}

  getAll(): Promise<UserResponseDto[]> {
    return this.repo.getAll();
  }
}
