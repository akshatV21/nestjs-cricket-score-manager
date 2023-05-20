import { Module } from '@nestjs/common'
import { MailerModule as MailModule } from '@nestjs-modules/mailer'
import { MailerService } from './mailer.service'

@Module({
  imports: [
    MailModule.forRootAsync({
      useFactory: configService => ({
        transport: {
          service: 'gmail',
          auth: {
            user: configService.get('MAIL_AUTH_USER'),
            pass: configService.get('MAIL_AUTH_PASS'),
          },
        },
        defaults: {
          from: 'a.vishwakarma1021@gmail.com',
          subject: 'No Reply <a.vishwakarma1021@gmail.com>',
        },
      }),
    }),
  ],
  controllers: [],
  providers: [MailerService],
  exports: [MailerService]
})
export class MailerModule {}
