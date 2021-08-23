export interface Character {
  id: number;
  name: string;
  description: string;
}

export interface ApiResponse {
  ok: boolean;
}

export interface CharactersApiResponse extends ApiResponse {
  characters?: Character[];
  etag?: string;
}

export interface CharacterApiResponse extends ApiResponse {
  character?: Character;
}

export interface CacheCharactersModel {
  etag: string;
  characters: Character[];
  lastUpdated: Date;
}
