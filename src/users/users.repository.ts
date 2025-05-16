import { ConflictException, Injectable } from '@nestjs/common';

import { DbService } from '../db/db.service';
import { User } from '../shared/dtos/users/users.dto';
import { CreateUserDto } from '../shared/dtos/users/create-user.dto';
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

  async create(user: CreateUserDto): Promise<UserResponseDto> {
    const newUser = {
      uuid: crypto.randomUUID(),
      ...user,
    };

    try {
      await this.collection.insertOne(newUser);
      return newUser;
    } catch (error: any) {
      if (error?.code === 11000) {
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }

  async delete(uuid: string): Promise<boolean> {
    const result = await this.collection.deleteOne({ uuid });
    return result.deletedCount === 1;
  }
}
