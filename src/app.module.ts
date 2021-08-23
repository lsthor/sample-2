import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CharacterModule } from './modules/character/character.module';

@Module({
  imports: [ConfigModule.forRoot(), CharacterModule],
})
export class AppModule {}
