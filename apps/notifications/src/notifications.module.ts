import { Module } from '@nestjs/common'
import { NotificationsController } from './notifications.controller'
import { NotificationsService } from './notifications.service'
import { ConfigModule } from '@nestjs/config'
import * as Joi from 'joi'
import { Authorize, DatabaseModule, RmqModule } from '@lib/common'
import { SERVICES, SocketSessions } from '@lib/utils'
import { MailerModule } from './mailer/mailer.module'
import { APP_GUARD } from '@nestjs/core'
import { NotificationsGateway } from './notifications.gateway'
import { EventEmitterModule } from '@nestjs/event-emitter'

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
        MAIL_AUTH_USER: Joi.string().required(),
        MAIL_AUTH_PASS: Joi.string().required(),
      }),
    }),
    RmqModule.register([SERVICES.AUTH_SERVICE]),
    DatabaseModule,
    MailerModule,
    EventEmitterModule.forRoot({ global: true }),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, { provide: APP_GUARD, useClass: Authorize }, SocketSessions, NotificationsGateway],
})
export class NotificationsModule {}
