import { Test, TestingModule } from '@nestjs/testing';
import { CharacterService } from './character.service';
import { CACHE_MANAGER } from '@nestjs/common';
import { CacheCharactersModel } from './types';
import { CHARACTERS_KEY } from './constants';
import { testCharacters } from '../../util/test.data';

const getCache = jest.fn();

describe('Character Service', () => {
  let characterService: CharacterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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

    characterService = module.get<CharacterService>(CharacterService);
  });

  describe('findAll', () => {
    it('should get empty array if cache is empty', async () => {
      getCache.mockImplementation(() => {
        return new Promise<CacheCharactersModel | undefined>((resolve) =>
          resolve(undefined),
        );
      });
      const characters = await characterService.listIds();
      expect(characters.length).toBe(0);
      expect(getCache).toBeCalledWith(CHARACTERS_KEY);
    });

    it('should get characters array if cache is not empty', async () => {
      getCache.mockImplementation(() => {
        return new Promise<CacheCharactersModel | undefined>((resolve) =>
          resolve({
            characters: testCharacters,
            lastUpdated: new Date(),
          }),
        );
      });
      const characters = await characterService.listIds();

      expect(characters.length).toBe(testCharacters.length);
      expect(characters).toEqual(testCharacters.map((c) => c.id));
    });
  });

  describe('findById', () => {
    it('should get characters by id if id exists', async () => {
      getCache.mockImplementation(() => {
        return new Promise<CacheCharactersModel | undefined>((resolve) =>
          resolve({
            characters: [
              { id: 12345, name: 'test-hero', description: 'something' },
            ],
            lastUpdated: new Date(),
          }),
        );
      });
      const character = await characterService.findById(12345);

      expect(getCache).toBeCalledWith(CHARACTERS_KEY);
      expect(character).toBeDefined();
      expect(character.id).toBe(12345);
      expect(character.name).toBe('test-hero');
      expect(character.description).toBe('something');
    });

    it('should get undefined if id is not found in the list', async () => {
      getCache.mockImplementation(() => {
        return new Promise<CacheCharactersModel | undefined>((resolve) =>
          resolve({
            characters: [
              { id: 12345, name: 'test-hero', description: 'something' },
            ],
            lastUpdated: new Date(),
          }),
        );
      });
      const character = await characterService.findById(1234);

      expect(character).toBeUndefined();
    });

    it('should get undefined if cache is empty', async () => {
      getCache.mockImplementation(() => {
        return new Promise<CacheCharactersModel | undefined>((resolve) =>
          resolve(undefined),
        );
      });
      const character = await characterService.findById(12345);

      expect(character).toBeUndefined();
    });
  });
});
