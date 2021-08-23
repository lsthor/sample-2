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
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Characters')
@Controller('characters')
@UseInterceptors(ClassSerializerInterceptor)
export class CharacterController {
  private readonly logger: Logger = new Logger(CharacterController.name);

  constructor(private readonly characterService: CharacterService) {}

  @Get(['/', ''])
  @ApiOperation({ summary: 'To retrieve a list of character Id' })
  @ApiResponse({
    status: 200,
    description: 'List of character id',
    type: [Number],
  })
  async getCharacters(): Promise<number[]> {
    return this.characterService.listIds();
  }

  @Get('/:id')
  @ApiOperation({ summary: 'To retrieve a character by Id' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'id',
    schema: { type: 'integer' },
  })
  @ApiResponse({
    status: 200,
    description: 'Character',
    type: Character,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or missing id',
  })
  @ApiResponse({
    status: 404,
    description: 'Character not found',
  })
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

    if (!character) {
      res.status(HttpStatus.NOT_FOUND).send();
      return;
    } else {
      return character;
    }
  }
}
