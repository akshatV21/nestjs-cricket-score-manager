import { Module } from '@nestjs/common';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';

@Module({
  imports: [],
  controllers: [MatchesController],
  providers: [MatchesService],
})
export class MatchesModule {}
