import { Module } from '@nestjs/common'
import { MailerModule as MailModule } from '@nestjs-modules/mailer'
import { MailerService } from './mailer.service'
import { ConfigService } from '@nestjs/config'
import { DatabaseModule, Request, RequestRepository, RequestSchema, Team, TeamRepository, TeamSchema, User, UserRepository, UserSchema } from '@lib/common'

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
      inject: [ConfigService],
    }),
    DatabaseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Team.name, schema: TeamSchema },
      { name: Request.name, schema: RequestSchema },
    ]),
  ],
  controllers: [],
  providers: [MailerService, UserRepository, TeamRepository, RequestRepository],
  exports: [MailerService],
})
export class MailerModule {}
