import { Module } from '@nestjs/common'
import { StatisticsController } from './statistics.controller'
import { StatisticsService } from './statistics.service'
import {
  Match,
  MatchSchema,
  Team,
  TeamSchema,
  User,
  UserSchema,
  DatabaseModule,
  UserRepository,
  TeamRepository,
  MatchRepository,
  Statistic,
  StatisticSchema,
  Performance,
  PerformanceSchema,
  PerformanceRepository,
} from '@lib/common'

@Module({
  imports: [
    DatabaseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Team.name, schema: TeamSchema },
      { name: Match.name, schema: MatchSchema },
      { name: Statistic.name, schema: StatisticSchema },
      { name: Performance.name, schema: PerformanceSchema },
    ]),
  ],
  controllers: [StatisticsController],
  providers: [StatisticsService, UserRepository, TeamRepository, MatchRepository, PerformanceRepository],
})
export class StatisticsModule {}
