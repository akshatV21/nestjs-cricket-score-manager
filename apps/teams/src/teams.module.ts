import { Module } from '@nestjs/common'
import { TeamsController } from './teams.controller'
import { TeamsService } from './teams.service'
import { ConfigModule } from '@nestjs/config'
import * as Joi from 'joi'
import { Authorize, DatabaseModule, RmqModule } from '@lib/common'
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
      }),
    }),
    RmqModule.register([SERVICES.AUTH_SERVICE, SERVICES.NOTIFICATIONS_SERVICE]),
    DatabaseModule,
  ],
  controllers: [TeamsController],
  providers: [TeamsService, { provide: APP_GUARD, useClass: Authorize }],
})
export class TeamsModule {}
