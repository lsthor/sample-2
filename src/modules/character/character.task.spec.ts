import { CharacterExternalApi } from './character.external.api';
import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/common';
import { CharacterTask } from './character.task';
import { CacheCharactersModel, CharactersApiResponse } from './types';
import { testCharacters as characters } from '../../util/test.data';
import { CHARACTERS_KEY } from './constants';

const setCache = jest.fn();
const getCache = jest.fn();

describe('Character Task', () => {
  let characterTask: CharacterTask;
  let characterExternalApi: CharacterExternalApi;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CharacterTask,
        CharacterExternalApi,
        {
          provide: CACHE_MANAGER,
          useFactory: () => ({
            set: setCache,
            get: getCache,
          }),
        },
      ],
    }).compile();

    characterTask = module.get<CharacterTask>(CharacterTask);
    characterExternalApi =
      module.get<CharacterExternalApi>(CharacterExternalApi);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call api with empty etag if cache is empty', async () => {
    getCache.mockImplementation(() => {
      return new Promise<CacheCharactersModel | undefined>((resolve) =>
        resolve(undefined),
      );
    });
    const spy = jest.spyOn(characterExternalApi, 'getCharacters');
    await characterTask.populateCharacters();
    expect(spy).toBeCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('');
  });

  it('should call api with etag if cache is not empty', async () => {
    getCache.mockImplementation(() => {
      return new Promise<CacheCharactersModel | undefined>((resolve) =>
        resolve({ etag: '123456', characters, lastUpdated: new Date() }),
      );
    });
    const spy = jest.spyOn(characterExternalApi, 'getCharacters');
    await characterTask.populateCharacters();

    expect(spy).toBeCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('123456');
  });

  it('should update cache if response is ok and contains both etag and characters', async () => {
    getCache.mockImplementation(() => {
      return new Promise<CacheCharactersModel | undefined>((resolve) =>
        resolve({ etag: '123456', characters, lastUpdated: new Date() }),
      );
    });
    const spy = jest.spyOn(characterExternalApi, 'getCharacters');
    spy.mockImplementation(() => {
      return new Promise<CharactersApiResponse>((resolve) => {
        resolve({ ok: true, etag: 'another-etag', characters });
      });
    });
    await characterTask.populateCharacters();

    expect(setCache).toBeCalledTimes(1);
    expect(setCache).toBeCalledWith(
      CHARACTERS_KEY,
      expect.objectContaining({
        etag: 'another-etag',
        characters,
      }),
      { ttl: 0 },
    );
  });

  it('should do nothing if response is ok but no characters', async () => {
    getCache.mockImplementation(() => {
      return new Promise<CacheCharactersModel | undefined>((resolve) =>
        resolve({ etag: '123456', characters, lastUpdated: new Date() }),
      );
    });
    const spy = jest.spyOn(characterExternalApi, 'getCharacters');
    spy.mockImplementation(() => {
      return new Promise<CharactersApiResponse>((resolve) => {
        resolve({ ok: true, etag: '123456' });
      });
    });
    await characterTask.populateCharacters();

    expect(setCache).not.toHaveBeenCalled();
  });

  // should do nothing if response is not ok
  it('should do nothing if response is ok but no characters', async () => {
    getCache.mockImplementation(() => {
      return new Promise<CacheCharactersModel | undefined>((resolve) =>
        resolve({ etag: '123456', characters, lastUpdated: new Date() }),
      );
    });
    const spy = jest.spyOn(characterExternalApi, 'getCharacters');
    spy.mockImplementation(() => {
      return new Promise<CharactersApiResponse>((resolve) => {
        resolve({ ok: false });
      });
    });
    await characterTask.populateCharacters();

    expect(setCache).not.toHaveBeenCalled();
  });
});
