import { Controller, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common'
import { NotificationsService } from './notifications.service'
import { EventPattern, Payload } from '@nestjs/microservices'
import { EVENTS, UserRegisteredDto } from '@lib/utils'
import { Auth, Authorize } from '@lib/common'

@Controller()
@UsePipes(new ValidationPipe())
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @EventPattern(EVENTS.USER_REGISTERED)
  @Auth({ isOpen: true })
  @UseGuards(Authorize)
  handleUserRegisteredEvent(@Payload() payload: UserRegisteredDto) {
    this.notificationsService.sendEmailVerificationMail(payload)
  }
}
