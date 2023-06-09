import { Module } from '@nestjs/common'
import { StatisticsController } from './statistics.controller'
import { StatisticsService } from './statistics.service'
import { ConfigModule } from '@nestjs/config'
import * as Joi from 'joi'
import { SERVICES } from '@lib/utils'
import {
  Match,
  MatchSchema,
  Team,
  TeamSchema,
  User,
  UserSchema,
  RmqModule,
  DatabaseModule,
  UserRepository,
  TeamRepository,
  Authorize,
  MatchRepository,
} from '@lib/common'
import { APP_GUARD } from '@nestjs/core'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().required(),
        MONGO_URI: Joi.string().required(),
        RMQ_URL: Joi.string().required(),
        RMQ_AUTH_QUEUE: Joi.string().required(),
        RMQ_NOTIFICATIONS_QUEUE: Joi.string().required(),
        RMQ_TEAMS_QUEUE: Joi.string().required(),
        RMQ_MATCHES_QUEUE: Joi.string().required(),
        RMQ_STATISTICS_QUEUE: Joi.string().required(),
      }),
    }),
    RmqModule.register([SERVICES.AUTH_SERVICE, SERVICES.NOTIFICATIONS_SERVICE, SERVICES.CHATS_SERVICE]),
    DatabaseModule,
    DatabaseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Team.name, schema: TeamSchema },
      { name: Match.name, schema: MatchSchema },
    ]),
  ],
  controllers: [StatisticsController],
  providers: [
    StatisticsService,
    { provide: APP_GUARD, useClass: Authorize },
    UserRepository,
    TeamRepository,
    MatchRepository,
  ],
})
export class StatisticsModule {}
