import { Module } from '@nestjs/common'
import { NotificationsController } from './notifications.controller'
import { NotificationsService } from './notifications.service'
import { ConfigModule } from '@nestjs/config'
import * as Joi from 'joi'
import { RmqModule } from '@lib/common'
import { SERVICES } from '@lib/utils'
import { MailerModule } from './mailer/mailer.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().required(),
        RMQ_URL: Joi.string().required(),
        RMQ_AUTH_QUEUE: Joi.string().required(),
        RMQ_NOTIFICATIONS_QUEUE: Joi.string().required(),
        MAIL_AUTH_USER: Joi.string().required(),
        MAIL_AUTH_PASS: Joi.string().required(),
      }),
    }),
    RmqModule.register([SERVICES.AUTH_SERVICE]),
    MailerModule,
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
})
export class NotificationsModule {}
