import { Module } from '@nestjs/common'
import { MatchesController } from './matches.controller'
import { MatchesService } from './matches.service'
import { ConfigModule } from '@nestjs/config'
import * as Joi from 'joi'
import {
  Authorize,
  DatabaseModule,
  Match,
  MatchRepository,
  MatchSchema,
  RmqModule,
  Team,
  TeamRepository,
  TeamSchema,
  User,
  UserRepository,
  UserSchema,
} from '@lib/common'
import { SERVICES } from '@lib/utils'
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
        RMQ_CHATS_QUEUE: Joi.string().required(),
        RMQ_MATCHES_QUEUE: Joi.string().required(),
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
  controllers: [MatchesController],
  providers: [
    MatchesService,
    UserRepository,
    TeamRepository,
    { provide: APP_GUARD, useClass: Authorize },
    MatchRepository,
  ],
})
export class MatchesModule {}
