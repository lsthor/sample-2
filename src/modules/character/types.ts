import { ApiProperty } from '@nestjs/swagger';

export class Character {
  @ApiProperty({ example: 12345, description: 'The Id of the character' })
  id: number;
  @ApiProperty({ example: 'name', description: 'The name of the character' })
  name: string;
  @ApiProperty({
    example: 'description',
    description: 'The description of the character',
  })
  description: string;
}

export interface CharactersApiResponse {
  ok: boolean;
  characters?: Character[];
}

export interface CacheCharactersModel {
  characters: Character[];
  lastUpdated: Date;
}
