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
} from '@lib/common'

@Module({
  imports: [
    DatabaseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Team.name, schema: TeamSchema },
      { name: Match.name, schema: MatchSchema },
    ]),
  ],
  controllers: [StatisticsController],
  providers: [StatisticsService, UserRepository, TeamRepository, MatchRepository],
})
export class StatisticsModule {}
