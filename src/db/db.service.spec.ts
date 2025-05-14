import { Db, MongoClient } from 'mongodb';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { DbService } from './db.service';

jest.mock('mongodb', () => ({
  MongoClient: {
    connect: jest.fn(),
  },
}));

describe('DbService', () => {
  let service: DbService;
  let mockConfigService: Partial<ConfigService>;
  let mockMongoClient: Partial<MongoClient>;
  let mockDb: Partial<Db>;

  beforeEach(async () => {
    mockConfigService = {
      get: jest.fn().mockReturnValue('mongodb://localhost:27017'),
    };

    mockDb = {};
    mockMongoClient = {
      db: jest.fn().mockReturnValue(mockDb),
      close: jest.fn(),
    };

    (MongoClient.connect as jest.Mock).mockResolvedValue(mockMongoClient);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DbService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<DbService>(DbService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should connect to MongoDB on module init', async () => {
    await service.onModuleInit();

    expect(MongoClient.connect).toHaveBeenCalledWith('mongodb://localhost:27017');
    expect(mockMongoClient.db).toHaveBeenCalledWith('users-app');
    expect(service.getDatabase()).toBe(mockDb);
  });

  it('should close MongoDB connection on module destroy', async () => {
    await service.onModuleInit();
    await service.onModuleDestroy();

    expect(mockMongoClient.close).toHaveBeenCalled();
  });

  it('should return the database instance', async () => {
    await service.onModuleInit();
    const db = service.getDatabase();
    expect(db).toBe(mockDb);
  });

  it('should throw an error if MongoClient.connect fails', async () => {
    (MongoClient.connect as jest.Mock).mockRejectedValue(new Error('Connection failed'));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DbService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    const failingService = module.get<DbService>(DbService);

    await expect(failingService.onModuleInit()).rejects.toThrow('Connection failed');
  });
});
