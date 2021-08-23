import { Test, TestingModule } from '@nestjs/testing';
import { CharacterController } from './character.controller';
import { CharacterService } from './character.service';
import { CACHE_MANAGER, HttpStatus } from '@nestjs/common';
import { CacheCharactersModel } from './types';
import { testCharacters } from '../../util/test.data';
import { Response } from 'express';

const getCache = jest.fn();

describe('Character Controller', () => {
  let appController: CharacterController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [CharacterController],
      providers: [
        CharacterService,
        {
          provide: CACHE_MANAGER,
          useFactory: () => ({
            get: getCache,
          }),
        },
      ],
    }).compile();

    appController = app.get<CharacterController>(CharacterController);
  });

  describe('getCharacters', () => {
    it('should return characters id', async () => {
      getCache.mockImplementation(() => {
        return new Promise<CacheCharactersModel | undefined>((resolve) =>
          resolve({
            etag: '123456',
            characters: testCharacters,
            lastUpdated: new Date(),
          }),
        );
      });

      const characters = await appController.getCharacters();

      expect(characters).toEqual(testCharacters.map((c) => c.id));
    });

    it('should return empty array if cache is empty', async () => {
      getCache.mockImplementation(() => {
        return new Promise<CacheCharactersModel | undefined>((resolve) =>
          resolve(undefined),
        );
      });

      const characters = await appController.getCharacters();

      expect(characters).toEqual([]);
    });
  });

  describe('getCharacterById', () => {
    it('should return character if id is matched', async () => {
      getCache.mockImplementation(() => {
        return new Promise<CacheCharactersModel | undefined>((resolve) =>
          resolve({
            etag: '123456',
            characters: [
              { id: 12345, name: 'test-hero', description: 'something' },
            ],
            lastUpdated: new Date(),
          }),
        );
      });

      const response = {
        status: () => HttpStatus.OK,
      } as any as Response;

      const character = await appController.getCharacterById(response, {
        id: 12345,
      });

      expect(character).toEqual({
        id: 12345,
        name: 'test-hero',
        description: 'something',
      });
    });

    it('should get 404 if id is not matched', async () => {
      getCache.mockImplementation(() => {
        return new Promise<CacheCharactersModel | undefined>((resolve) =>
          resolve({
            etag: '123456',
            characters: [
              { id: 12345, name: 'test-hero', description: 'something' },
            ],
            lastUpdated: new Date(),
          }),
        );
      });

      const mockedSend = jest.fn();
      const response = {
        status: (code: number) => ({
          send: () => mockedSend(code),
        }),
      } as any as Response;

      const character = await appController.getCharacterById(response, {
        id: 123,
      });

      expect(character).toBeUndefined();
      expect(mockedSend).toBeCalledWith(404);
    });

    it('should get 404 if cache is empty', async () => {
      getCache.mockImplementation(() => {
        return new Promise<CacheCharactersModel | undefined>((resolve) =>
          resolve(undefined),
        );
      });

      const mockedSend = jest.fn();
      const response = {
        status: (code: number) => ({
          send: () => mockedSend(code),
        }),
      } as any as Response;

      const character = await appController.getCharacterById(response, {
        id: 123,
      });

      expect(character).toBeUndefined();
      expect(mockedSend).toBeCalledWith(404);
    });

    it('should get 400 if id is not numeric', async () => {
      const mockedSend = jest.fn();
      const response = {
        status: (code: number) => ({
          send: () => mockedSend(code),
        }),
      } as any as Response;

      const character = await appController.getCharacterById(response, {
        id: 'not-a-number',
      });

      expect(character).toBeUndefined();
      expect(mockedSend).toBeCalledWith(400);
    });
  });
});
