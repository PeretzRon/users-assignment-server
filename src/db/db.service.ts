import { Db, MongoClient } from 'mongodb';
import { ConfigService } from '@nestjs/config';
import {
  Injectable, Logger, OnModuleDestroy, OnModuleInit,
} from '@nestjs/common';

@Injectable()
export class DbService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DbService.name);

  private client: MongoClient;

  private db: Db;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    this.client = await MongoClient.connect(this.configService.get('MONGO_URI')!);
    this.db = this.client.db('users-app');
    this.logger.log('MongoDB connected');
  }

  getDatabase(): Db {
    return this.db;
  }

  async onModuleDestroy() {
    await this.client.close();
    this.logger.log('MongoDB Connection closed');
  }
}
