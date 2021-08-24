import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import fetch from 'node-fetch';
import { Character, CharactersApiResponse } from './types';

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

  async getCharacters(etag: string): Promise<CharactersApiResponse> {
    try {
      const ts = new Date().getTime();
      const hash = this.toMd5(
        `${ts}${process.env.PRIVATE_KEY}${process.env.PUBLIC_KEY}`,
      );
      const apiKey = process.env.PUBLIC_KEY;
      const url = `${process.env.API_DOMAIN}/v1/public/characters?limit=100&ts=${ts}&hash=${hash}&apikey=${apiKey}`;
      const response = await fetch(url, {
        method: 'get',
        headers: { 'Content-Type': 'application/json', 'If-None-Match': etag },
      });

      if (response.status === HttpStatus.OK) {
        const responseJson = await response.json();
        const etagInResponse = responseJson.etag;
        const characters: Character[] = responseJson.data.results.map(
          (result: any) => {
            const { id, name, description } = result;
            return { id, name, description };
          },
        );
        return { ok: true, etag: etagInResponse, characters };
      } else if (response.status === HttpStatus.NOT_MODIFIED) {
        return { ok: true, etag };
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
