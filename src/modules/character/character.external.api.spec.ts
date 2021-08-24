import { CharacterExternalApi } from './character.external.api';
import { mocked } from 'ts-jest/utils';
import fetch, { Response } from 'node-fetch';
import { Test, TestingModule } from '@nestjs/testing';
import {
  dataPage1,
  dataPage2,
  dataPage3,
  testCharacters as characters,
} from '../../util/test.data';

jest.mock('node-fetch');

describe('Character External API', () => {
  let characterExternalApi: CharacterExternalApi;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CharacterExternalApi],
    }).compile();

    characterExternalApi =
      module.get<CharacterExternalApi>(CharacterExternalApi);
  });

  describe('get characters', () => {
    it('should return response with list of characters if ok is true', async () => {
      mocked(fetch).mockImplementation(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve({
              etag: '',
              data: {
                total: characters.length,
                results: characters,
              },
            }),
        } as Response),
      );
      const response = await characterExternalApi.getCharacters();
      expect(response.ok).toBeTruthy();
      expect(JSON.stringify(response.characters)).toBe(
        JSON.stringify(characters),
      );
    });

    it('should return response with ok false if encounter error', async () => {
      mocked(fetch).mockImplementation(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => {
            Promise.resolve('s');
          },
        } as Response),
      );

      await expect(characterExternalApi.getCharacters()).resolves.toEqual({
        ok: false,
      });
    });

    it('should return response with ok false if ok is false', async () => {
      mocked(fetch).mockImplementation(() =>
        Promise.resolve({ ok: false, status: 500 } as Response),
      );
      const response = await characterExternalApi.getCharacters();
      expect(response.ok).toBeFalsy();
      expect(response.characters).toBeUndefined();
    });

    it('should return response with ok false if status code is 409', async () => {
      mocked(fetch).mockImplementation(() =>
        Promise.resolve({
          ok: false,
          status: 409,
          json: () =>
            Promise.resolve({
              code: 409,
              status: 'You may not request more than 100 items.',
            }),
        } as Response),
      );
      const response = await characterExternalApi.getCharacters();
      expect(response.ok).toBeFalsy();
      expect(response.characters).toBeUndefined();
    });

    it('should return response with ok and without characters if response status is 304', async () => {
      mocked(fetch).mockImplementation(() =>
        Promise.resolve({ ok: true, status: 304 } as Response),
      );
      const response = await characterExternalApi.getCharacters();
      expect(response.ok).toBeTruthy();
      expect(response.characters).toBeUndefined();
    });

    it('should retrieve subsequent paged data if total is more than 100', async () => {
      mocked(fetch).mockImplementation((url) => {
        console.log(url);
        // first fetch
        const getDataPage = (tempUrl) => {
          if (
            tempUrl
              .toString()
              .indexOf('/v1/public/characters?limit=100&offset=0') >= 0
          ) {
            return dataPage1;
          } else if (
            tempUrl
              .toString()
              .indexOf('/v1/public/characters?limit=100&offset=100') >= 0
          ) {
            return dataPage2;
          } else {
            return dataPage3;
          }
        };
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(getDataPage(url)),
        } as Response);
      });
      const response = await characterExternalApi.getCharacters();
      expect(response.ok).toBeTruthy();

      expect(response.characters.length).toBe(dataPage1.data.total);
    });
  });
});
