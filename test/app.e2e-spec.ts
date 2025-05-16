import * as request from 'supertest';
import { Db, MongoClient } from 'mongodb';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Logger, INestApplication } from '@nestjs/common';

import { delay } from './utils';
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
    db.createCollection('users');
    db.collection('users').createIndex({ email: 1 }, { unique: true });

    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'verbose').mockImplementation(() => {});
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

    await delay(500);

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

  it('/users (POST) - should fail to create a user with duplicate email and return 409 Conflict', async () => {
    const body: CreateUserDto = {
      firstName: 'Test',
      lastName: 'Test',
      email: 'duplicate@g.com',
      password: '123456',
    };

    await request(app.getHttpServer()).post('/users').send(body).expect(201);
    await delay(300);
    await request(app.getHttpServer()).post('/users').send(body).expect(409);
  });

  it('/users/:uuid (DELETE) - should delete a user successfully', async () => {
    const createUserBody = {
      firstName: 'Test',
      lastName: 'User',
      email: 'testuser@g.com',
      password: '123456',
    };

    // prettier-ignore
    const createResponse = await request(app.getHttpServer())
      .post('/users')
      .send(createUserBody)
      .expect(201);

    const userUuid = createResponse.body.uuid;

    // prettier-ignore
    const deleteResponse = await request(app.getHttpServer())
      .delete(`/users/${userUuid}`)
      .expect(200);
    expect(deleteResponse.body).toMatchObject({
      deleted: true,
    });

    await delay(200);
    const users = await db.collection('users').find().toArray();
    expect(users.length).toBe(0);
  });

  it('/users/:uuid (DELETE) - should fail to delete a non-existent user', async () => {
    const nonExistentUuid = 'non-existent-uuid';
    await request(app.getHttpServer()).delete(`/users/${nonExistentUuid}`).expect(404);
  });
});
