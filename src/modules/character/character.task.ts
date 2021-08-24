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

    this.logger.log(`querying api`);
    const response = await this.characterExternalApi.getCharacters();
    if (response.ok && response.characters) {
      this.logger.log('only update cached model if characters are defined');
      await this.cacheManager.set<CacheCharactersModel>(
        CHARACTERS_KEY,
        {
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
