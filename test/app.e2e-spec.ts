import * as request from 'supertest';
import { Db, MongoClient } from 'mongodb';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';

import { AppModule } from '../src/app.module';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;
  let mongoClient: MongoClient;
  let db: Db;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    process.env.MONGO_URI = uri;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    mongoClient = new MongoClient(uri);
    await mongoClient.connect();
    db = mongoClient.db('users-app');
  });

  afterAll(async () => {
    await mongoClient.close();
    await mongoServer.stop();
    await app.close();
  });

  it('/users (GET)', async () => {
    const response = await request(app.getHttpServer()).get('/users').expect(200);
    expect(response.body).toEqual(expect.arrayContaining([]));
  });
});
