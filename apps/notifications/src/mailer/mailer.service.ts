import { Injectable } from '@nestjs/common'
import { ISendMailOptions, MailerService as MailService } from '@nestjs-modules/mailer'
import { UserRegisteredDto } from '@lib/utils'
import { RequestDocument, RequestRepository, TeamRepository, UserRepository } from '@lib/common'

@Injectable()
export class MailerService {
  constructor(
    private mailService: MailService,
    private readonly UserRepository: UserRepository,
    private readonly TeamRepository: TeamRepository,
    private readonly RequestRepository: RequestRepository,
  ) {}

  async sendEmailVerificationMail({ email, name, jwt }: UserRegisteredDto) {
    this.mailService.sendMail({ to: email, text: `Hey ${name}, heres your email verification token - ${jwt}` })
  }

  async sendRequestCreatedMail(request: RequestDocument) {
    const getTeamPromise = this.TeamRepository.findById(request.team)
    const getUserPromise = this.UserRepository.findById(request.user)

    const [team, user] = await Promise.all([getTeamPromise, getUserPromise])

    const mailOptions: ISendMailOptions = {
      to: user.email,
      subject: `Request to join a team`,
      text: `The team, ${team.name} has requested you to join their team as a ${request.type.split('-')[0]}.`,
    }

    this.mailService.sendMail(mailOptions)
  }
}
