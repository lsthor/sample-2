import { CacheModule, Logger, Module, OnModuleInit } from '@nestjs/common';
import { CharacterService } from './character.service';
import { CharacterController } from './character.controller';
import { CharacterExternalApi } from './character.external.api';
import { CharacterTask } from './character.task';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';

@Module({
  providers: [CharacterService, CharacterExternalApi, CharacterTask],
  imports: [CacheModule.register({ ttl: 3600 })],
  controllers: [CharacterController],
})
export class CharacterModule implements OnModuleInit {
  private logger = new Logger(CharacterModule.name);

  constructor(
    private readonly characterTask: CharacterTask,
    private schedulerRegistry: SchedulerRegistry,
  ) {}
  async onModuleInit(): Promise<any> {
    // await this.characterTask.populateCharacters();
    this.logger.log('character module init');
    const milliseconds =
      (parseInt(process.env.POPULATE_CHARACTERS_INTERVAL) || 60) * 1000;
    const populateCharacterCallback = async () => {
      await this.characterTask.populateCharacters();
    };
    await populateCharacterCallback();
    const interval = setInterval(populateCharacterCallback, milliseconds);
    this.schedulerRegistry.addInterval('populate-characters', interval);
  }
}
