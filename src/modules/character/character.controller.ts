import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpStatus,
  Logger,
  Param,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { CharacterService } from './character.service';
import { Character } from './types';
import { Response } from 'express';

@Controller('characters')
@UseInterceptors(ClassSerializerInterceptor)
export class CharacterController {
  private readonly logger: Logger = new Logger(CharacterController.name);

  constructor(private readonly characterService: CharacterService) {}

  @Get(['/', ''])
  async getCharacters(): Promise<Character[]> {
    return this.characterService.findAll();
  }

  @Get('/:id')
  async getCharacterById(
    @Res({ passthrough: true }) res: Response,
    @Param() params,
  ): Promise<Character> {
    const id = params.id;
    if (isNaN(id)) {
      res.status(HttpStatus.BAD_REQUEST).send();
      return;
    }
    const character = await this.characterService.findById(parseInt(id));
    this.logger.log(character);
    if (!character) {
      res.status(HttpStatus.NOT_FOUND).send();
      return;
    } else {
      return character;
    }
  }
}
