import { Controller, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common'
import { NotificationsService } from './notifications.service'
import { EventPattern, Payload } from '@nestjs/microservices'
import { EVENTS, RequestAcceptedDto, RequestCreatedDto, UserRegisteredDto } from '@lib/utils'
import { Auth, Authorize } from '@lib/common'
import { EventEmitter2 } from '@nestjs/event-emitter'

@Controller()
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @EventPattern(EVENTS.USER_REGISTERED)
  @Auth({ isOpen: true })
  @UseGuards(Authorize)
  handleUserRegisteredEvent(@Payload() payload: UserRegisteredDto) {
    this.notificationsService.sendEmailVerificationMail(payload)
  }

  @EventPattern(EVENTS.REQUEST_CREATED)
  @Auth({ types: ['manager'] })
  @UseGuards(Authorize)
  handleRequestCreatedEvent(@Payload() payload: RequestCreatedDto) {
    this.eventEmitter.emit(EVENTS.REQUEST_CREATED, payload)
  }

  @EventPattern(EVENTS.REQUEST_ACCEPTED)
  @Auth({ types: ['player', 'scorer'] })
  @UseGuards(Authorize)
  handleRequestAcceptedEvent(@Payload() payload: RequestAcceptedDto) {
    this.eventEmitter.emit(EVENTS.REQUEST_ACCEPTED, payload)
  }

  @EventPattern(EVENTS.REQUEST_DENIED)
  @Auth({ types: ['player', 'scorer'] })
  @UseGuards(Authorize)
  handleRequestDeniedEvent(@Payload() payload: RequestCreatedDto) {
    this.eventEmitter.emit(EVENTS.REQUEST_DENIED, payload)
  }
}
