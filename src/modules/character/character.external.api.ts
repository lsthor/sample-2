import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import fetch, { Response } from 'node-fetch';
import { Character, CharactersApiResponse } from './types';
import { constructUrls, urlTemplate } from '../../util/url.helper';

@Injectable()
export class CharacterExternalApi {
  private readonly logger: Logger = new Logger(CharacterExternalApi.name);

  private toMd5(str: string): string {
    return crypto.createHash('md5').update(str).digest('hex');
  }

  // async getCharacterById(id: number): Promise<CharacterApiResponse> {
  //   try {
  //     const ts = new Date().getTime() as unknown as string;
  //     const hash = this.toMd5(
  //       `${ts}${process.env.PRIVATE_KEY}${process.env.PUBLIC_KEY}`,
  //     );
  //     const apiKey = process.env.PUBLIC_KEY;
  //     const url = `${process.env.API_DOMAIN}/v1/public/characters/${id}?ts=${ts}&hash=${hash}&apikey=${apiKey}`;
  //     const response = await fetch(url, {
  //       method: 'get',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'If-None-Match': '83e86ebbc2e74a3f9fc6c6bb92b1ab838d4865b0',
  //       },
  //     });
  //
  //     switch (response.status) {
  //       case 200:
  //         const responseJson = await response.json();
  //         const { id, name, description } = responseJson.data.results[0];
  //         return { ok: true, character: { id, name, description } };
  //       case 304:
  //         this.logger.log('from cache');
  //         return { ok: true };
  //       default:
  //         return { ok: false };
  //     }
  //   } catch (error) {
  //     console.log(`encountered error - ${error}`);
  //     return { ok: false };
  //   }
  // }

  fetchCharactersData(path: string): Promise<Response> {
    const ts = new Date().getTime();
    const hash = this.toMd5(
      `${ts}${process.env.PRIVATE_KEY}${process.env.PUBLIC_KEY}`,
    );
    const apiKey = process.env.PUBLIC_KEY;
    const url = `${process.env.API_DOMAIN}${path}&ts=${ts}&hash=${hash}&apikey=${apiKey}`;
    return fetch(url, {
      method: 'get',
      headers: { 'Content-Type': 'application/json' },
    });
  }

  toCharacter({ id, name, description }): Character {
    return { id, name, description };
  }

  async fetchOtherCharactersFromOtherPage(total: number): Promise<Character[]> {
    const urls = constructUrls(total);
    if (urls.length > 1) {
      // drop the first element because already fetched
      const responses = await Promise.all(
        urls.slice(1).map((u) => this.fetchCharactersData(u)),
      );
      const arr = [];
      for (const response of responses) {
        const responseJson = await response.json();

        arr.push(responseJson.data.results.map(this.toCharacter));
      }

      return arr.flat() as Character[];
    } else {
      return [];
    }
  }

  async getCharacters(): Promise<CharactersApiResponse> {
    try {
      const response = await this.fetchCharactersData(urlTemplate(100));

      if (response.status === HttpStatus.OK) {
        const responseJson = await response.json();

        const otherCharacters = await this.fetchOtherCharactersFromOtherPage(
          responseJson.data.total,
        );
        // const etagInResponse = responseJson.etag;
        const characters: Character[] = responseJson.data.results.map(
          this.toCharacter,
        );

        return { ok: true, characters: [...characters, ...otherCharacters] };
      } else if (response.status === HttpStatus.NOT_MODIFIED) {
        return { ok: true };
      } else {
        const responseJson = await response.json();
        this.logger.error(responseJson.status);
        return { ok: false };
      }
    } catch (error) {
      this.logger.log(`encountered error - ${error}`);
      return { ok: false };
    }
  }
}
