import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { CacheCharactersModel, Character } from './types';
import { Cache } from 'cache-manager';
import { CHARACTERS_KEY } from './constants';

@Injectable()
export class CharacterService {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  getCachedModel() {
    return this.cacheManager.get<CacheCharactersModel>(CHARACTERS_KEY);
  }

  async listIds(): Promise<number[]> {
    const cache = await this.getCachedModel();
    if (cache) {
      return cache.characters.map((c) => c.id);
    }
    return [];
  }

  async findById(id: number): Promise<Character | undefined> {
    const cache = await this.getCachedModel();
    if (cache) {
      return cache.characters.find((c) => c.id === id);
    }
    return undefined;
  }
}
