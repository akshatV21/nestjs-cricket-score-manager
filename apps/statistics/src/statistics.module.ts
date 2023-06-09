import { Module } from '@nestjs/common';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';

@Module({
  imports: [],
  controllers: [StatisticsController],
  providers: [StatisticsService],
})
export class StatisticsModule {}
