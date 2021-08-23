import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { CharacterExternalApi } from './character.external.api';
import { Cache } from 'cache-manager';
import { CacheCharactersModel } from './types';
import { CHARACTERS_KEY } from './constants';

@Injectable()
export class CharacterTask {
  private readonly logger = new Logger(CharacterTask.name);

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly characterExternalApi: CharacterExternalApi,
  ) {}

  async populateCharacters() {
    this.logger.log('start populating characters');
    this.logger.log('load models from cached');
    const cachedCharacters = await this.cacheManager.get<CacheCharactersModel>(
      CHARACTERS_KEY,
    );

    const etag = cachedCharacters ? cachedCharacters.etag : '';
    this.logger.log(`querying api with etag ${etag}`);
    const response = await this.characterExternalApi.getCharacters(etag);
    if (response.ok && response.etag && response.characters) {
      this.logger.log(
        'only update cached model if both etag and characters are defined',
      );
      await this.cacheManager.set<CacheCharactersModel>(
        CHARACTERS_KEY,
        {
          etag: response.etag,
          characters: response.characters,
          lastUpdated: new Date(),
        },
        { ttl: 0 },
      );
    } else {
      this.logger.log('not refreshing characters in cache now');
    }
    return;
  }
}
