import { Injectable } from '@nestjs/common'
import { ISendMailOptions, MailerService as MailService } from '@nestjs-modules/mailer'
import { RequestAcceptedDto, RequestCreatedDto, RequestDeniedDto, UserRegisteredDto } from '@lib/utils'
import { RequestRepository, TeamRepository, UserRepository } from '@lib/common'
import { Types } from 'mongoose'

@Injectable()
export class MailerService {
  constructor(
    private mailService: MailService,
    private readonly UserRepository: UserRepository,
    private readonly TeamRepository: TeamRepository,
  ) {}

  async sendEmailVerificationMail({ email, name, jwt }: UserRegisteredDto) {
    this.mailService.sendMail({ to: email, text: `Hey ${name}, heres your email verification token - ${jwt}` })
  }

  async sendRequestCreatedMail({ body }: RequestCreatedDto) {
    const mailOptions: ISendMailOptions = {
      to: body.userEmail,
      subject: `Request to join a team`,
      text: `The team, ${body.teamName} has requested you to join their team as a ${body.requestType.split('-')[0]}.`,
    }

    this.mailService.sendMail(mailOptions)
  }

  async sendRequestAcceptedMail({ body }: RequestAcceptedDto) {
    const manager = await this.UserRepository.findById(body.managerId, { firstName: 1, lastName: 1, email: 1 })

    const mailOptions: ISendMailOptions = {
      to: manager.email,
      subject: `Request Accepet to join your team`,
      text: `The request sent to ${body.userName} by your team, ${
        body.teamName
      } has been accepted and has joined your team as a ${body.requestType.split('-')[0]}.`,
    }

    this.mailService.sendMail(mailOptions)
  }

  async sendRequestDeniedMail({ body }: RequestDeniedDto) {
    const manager = await this.UserRepository.findById(body.managerId, { firstName: 1, lastName: 1, email: 1 })

    const mailOptions: ISendMailOptions = {
      to: manager.email,
      subject: `Request Denied to join your team`,
      text: `The request sent to ${body.userName} by your team, ${
        body.teamName
      } has been denied and has will not be joining your team as a ${body.requestType.split('-')[0]}.`,
    }

    this.mailService.sendMail(mailOptions)
  }

  async getTeamAndUserById(teamId: string | Types.ObjectId, userId: string | Types.ObjectId) {
    const getTeamPromise = this.TeamRepository.findById(teamId)
    const getUserPromise = this.UserRepository.findById(userId)
    return await Promise.all([getTeamPromise, getUserPromise])
  }
}
