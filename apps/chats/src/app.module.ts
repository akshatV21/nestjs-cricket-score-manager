import { Module } from '@nestjs/common'
import { ChatsModule } from './chats/chats.module'
import { ConfigModule } from '@nestjs/config'
import * as Joi from 'joi'
import { Authorize, Chat, ChatSchema, DatabaseModule, RmqModule, Team, TeamSchema, User, UserSchema } from '@lib/common'
import { SERVICES } from '@lib/utils'
import { APP_GUARD } from '@nestjs/core'
import { MessagesModule } from './messages/messages.module'

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
      }),
    }),
    RmqModule.register([SERVICES.AUTH_SERVICE, SERVICES.NOTIFICATIONS_SERVICE, SERVICES.TEAMS_SERVICE]),
    DatabaseModule,
    ChatsModule,
    MessagesModule,
  ],
  controllers: [],
  providers: [{ provide: APP_GUARD, useClass: Authorize }],
})
export class AppModule {}
