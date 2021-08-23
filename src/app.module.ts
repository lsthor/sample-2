import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CharacterModule } from './modules/character/character.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [ConfigModule.forRoot(), ScheduleModule.forRoot(), CharacterModule],
})
export class AppModule {}
