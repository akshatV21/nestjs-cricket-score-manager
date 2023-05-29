import { Module } from '@nestjs/common'
import { TeamsController } from './teams.controller'
import { TeamsService } from './teams.service'
import { ConfigModule } from '@nestjs/config'
import * as Joi from 'joi'
import {
  Authorize,
  DatabaseModule,
  Request,
  RequestSchema,
  RmqModule,
  Team,
  TeamSchema,
  User,
  UserRepository,
  UserSchema,
  TeamRepository,
  RequestRepository,
} from '@lib/common'
import { SERVICES } from '@lib/utils'
import { APP_GUARD } from '@nestjs/core'
import { RequestsModule } from './requests/requests.module'

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
      { name: Request.name, schema: RequestSchema },
    ]),
    RequestsModule,
  ],
  controllers: [TeamsController],
  providers: [TeamsService, { provide: APP_GUARD, useClass: Authorize }, UserRepository, TeamRepository],
})
export class TeamsModule {}
