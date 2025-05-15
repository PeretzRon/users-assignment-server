import * as request from 'supertest';
import { Db, MongoClient } from 'mongodb';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';

import { AppModule } from '../src/app.module';
import { CreateUserDto } from '../src/shared/dtos/users/create-user.dto';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;
  let mongoClient: MongoClient;
  let db: Db;

  beforeEach(async () => {
    await db.collection('users').deleteMany({});
  });

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

  it('/users (GET) - should get users, at the beginning there is not users, should return empty array', async () => {
    const response = await request(app.getHttpServer()).get('/users').expect(200);
    expect(response.body).toEqual(expect.arrayContaining([]));
  });

  it('/users (POST) - should create a user and ensure the password is not returned in the response', async () => {
    const body: CreateUserDto = {
      firstName: 'Test',
      lastName: 'Test',
      email: 'test@g.com',
      password: '123456',
    };

    const response = await request(app.getHttpServer()).post('/users').send(body).expect(201);

    expect(response.body).toMatchObject({
      uuid: expect.any(String),
      firstName: 'Test',
      lastName: 'Test',
      email: 'test@g.com',
    });

    expect(response.body).not.toHaveProperty('password');
    await new Promise((resolve) => {
      setTimeout(() => resolve(undefined), 500);
    });

    const users = await db.collection('users').find().toArray();
    expect(users.length).toBe(1);
    expect(users[0].email).toBe(body.email);
    expect(users[0].firstName).toBe(body.firstName);
  });

  it('/users (POST) - should failed due to invalid body', async () => {
    const bodyWithoutFirstName = {
      lastName: 'Test',
      email: 'test@g.com',
      password: '123456',
    };
    const bodyWithoutLastName = {
      firstName: 'Test',
      email: 'test@g.com',
      password: '123456',
    };

    const bodyWithMinPasswordLength: CreateUserDto = {
      firstName: 'Test',
      lastName: 'Test',
      email: 'test@g.com',
      password: '1234',
    };

    await Promise.all([
      request(app.getHttpServer()).post('/users').send(bodyWithoutFirstName).expect(400),
      request(app.getHttpServer()).post('/users').send(bodyWithoutLastName).expect(400),
      request(app.getHttpServer()).post('/users').send(bodyWithMinPasswordLength).expect(400),
    ]);
  });
});
