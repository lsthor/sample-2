import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { CharacterModule } from '../src/modules/character/character.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CharacterModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('should return list of characters with etag header', () => {
    return request(app.getHttpServer())
      .get('/characters/')
      .expect(200)
      .expect((res) => expect(res.headers['etag']).toBeDefined());
  });

  it('should be able to get a character by id', () => {
    return request(app.getHttpServer()).get('/characters/12345').expect(404);
  });

  it('should return bad request if character id is not numeric', () => {
    return request(app.getHttpServer()).get('/characters/1234dd5').expect(400);
  });
});
