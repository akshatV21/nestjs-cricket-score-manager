import { Controller, UsePipes, ValidationPipe } from '@nestjs/common'
import { NotificationsService } from './notifications.service'
import { EventPattern, Payload } from '@nestjs/microservices'
import { EVENTS, UserRegisteredDto } from '@lib/utils'

@Controller()
@UsePipes(new ValidationPipe())
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @EventPattern(EVENTS.USER_REGISTERED)
  handleUserRegisteredEvent(@Payload() payload: UserRegisteredDto) {
    this.notificationsService.sendValidationEmail(payload)
  }
}
