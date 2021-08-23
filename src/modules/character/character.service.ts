import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { CacheCharactersModel, Character } from './types';
import { Cache } from 'cache-manager';
import { CHARACTERS_KEY } from './constants';

@Injectable()
export class CharacterService {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  async findAll(): Promise<Character[]> {
    const cache = await this.cacheManager.get<CacheCharactersModel>(
      CHARACTERS_KEY,
    );
    if (cache) {
      return cache.characters;
    }
    return [];
  }

  async findById(id: number): Promise<Character | undefined> {
    const cache = await this.cacheManager.get<CacheCharactersModel>(
      CHARACTERS_KEY,
    );
    if (cache) {
      return cache.characters.find((c) => c.id === id);
    }
    return undefined;
  }
}
