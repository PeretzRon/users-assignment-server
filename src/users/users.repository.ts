import { Injectable } from '@nestjs/common';

import { DbService } from '../db/db.service';
import { User } from '../shared/dtos/users/users.dto';
import { UserResponseDto } from '../shared/dtos/users/user-response.dto';

@Injectable()
export class UsersRepository {
  constructor(private readonly db: DbService) {}

  private get collection() {
    return this.db.getDatabase().collection<User>('users');
  }

  async getAll(): Promise<UserResponseDto[]> {
    return (await this.collection.find({}).project({ _id: 0 }).toArray()) as UserResponseDto[];
  }
}
