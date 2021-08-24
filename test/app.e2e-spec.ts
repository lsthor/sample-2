import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { CharacterModule } from '../src/modules/character/character.module';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        ScheduleModule.forRoot(),
        CharacterModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return list of characters', () => {
    return request(app.getHttpServer()).get('/characters/').expect(200);
  });

  it('should be able to get a character', () => {
    return request(app.getHttpServer()).get('/characters/1011334').expect(200);
  });

  it('should not be able to get a character if no id matched', () => {
    return request(app.getHttpServer()).get('/characters/12345').expect(404);
  });

  it('should return bad request if character id is not numeric', () => {
    return request(app.getHttpServer()).get('/characters/1234dd5').expect(400);
  });
});
