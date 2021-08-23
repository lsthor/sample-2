import { CacheModule, Module, OnModuleInit } from '@nestjs/common';
import { CharacterService } from './character.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import Character from './character.entity';
import { CharacterController } from './character.controller';
import { CharacterExternalApi } from './character.external.api';
import { CharacterTask } from './character.task';

@Module({
  providers: [CharacterService, CharacterExternalApi, CharacterTask],
  imports: [
    CacheModule.register({ ttl: 3600 }),
    TypeOrmModule.forFeature([Character]),
  ],
  controllers: [CharacterController],
})
export class CharacterModule implements OnModuleInit {
  constructor(private readonly characterTask: CharacterTask) {}
  async onModuleInit(): Promise<any> {
    await this.characterTask.populateCharacters();
  }
}
