import { UserRegisteredDto } from '@lib/utils'
import { Injectable } from '@nestjs/common'
import { MailerService } from './mailer/mailer.service'

@Injectable()
export class NotificationsService {
  constructor(private readonly mailerService: MailerService) {}

  async sendEmailVerificationMail(userRegisteredDto: UserRegisteredDto) {
    this.mailerService.sendEmailVerificationMail(userRegisteredDto)
  }
}
