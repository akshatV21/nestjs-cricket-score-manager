import { Injectable } from '@nestjs/common'
import { MailerService as MailService } from '@nestjs-modules/mailer'
import { UserRegisteredDto } from '@lib/utils'

@Injectable()
export class MailerService {
  constructor(private mailService: MailService) {}

  async sendEmailVerificationMail({ email, name, token }: UserRegisteredDto) {
    await this.mailService.sendMail({ to: email, text: `Hey ${name}, heres your email verification token - ${token}` })
  }
}
