import { Authorize } from '@lib/common'
import {
  AuthenticatedSocket,
  AuthorizeDto,
  EVENTS,
  EXCEPTION_MSGS,
  RequestAcceptedDto,
  RequestCreatedDto,
  RequestDeniedDto,
  SERVICES,
  SocketSessions,
  catchAuthErrors,
} from '@lib/utils'
import { ExecutionContext, Inject, UseGuards } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WsException,
} from '@nestjs/websockets'
import { Server } from 'socket.io'
import { MailerService } from './mailer/mailer.service'
import { ClientProxy } from '@nestjs/microservices'
import { lastValueFrom } from 'rxjs'

@WebSocketGateway(8084, { namespace: 'notifications', cors: { origin: '*' } })
@UseGuards(Authorize)
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly socketSessions: SocketSessions,
    private readonly mailerService: MailerService,
    @Inject(SERVICES.AUTH_SERVICE) private readonly authService: ClientProxy,
  ) {}

  @WebSocketServer()
  server: Server

  async handleConnection(socket: AuthenticatedSocket) {
    const token = socket.handshake.auth.token
    if (!token) throw new WsException(EXCEPTION_MSGS.NULL_TOKEN)

    const response = await lastValueFrom(
      this.authService.send<any, AuthorizeDto>(EVENTS.AUTHORIZE, {
        token,
        types: [],
        requestContextType: 'ws',
      }),
    ).catch(err => catchAuthErrors(err, 'ws'))
    this.socketSessions.setSocket(response.userId, socket)
  }

  handleDisconnect(socket: AuthenticatedSocket) {
    this.socketSessions.removeSocket(socket.entityId)
  }

  @OnEvent(EVENTS.REQUEST_CREATED)
  handleRequestCreatedEvent(data: RequestCreatedDto) {
    const { body } = data
    const socket = this.socketSessions.getSocket(body.userId)

    if (socket) socket.emit(EVENTS.REQUEST_CREATED, body)
    else this.mailerService.sendRequestCreatedMail(data)
  }

  @OnEvent(EVENTS.REQUEST_ACCEPTED)
  async handleRequestAcceptedEvent(data: RequestAcceptedDto) {
    const { body } = data
    const socket = this.socketSessions.getSocket(body.managerId)

    if (socket) socket.emit(EVENTS.REQUEST_ACCEPTED, body)
    else this.mailerService.sendRequestAcceptedMail(data)
  }

  @OnEvent(EVENTS.REQUEST_DENIED)
  handleRequestDeniedEvent(data: RequestDeniedDto) {
    const { body } = data
    const socket = this.socketSessions.getSocket(body.managerId)

    if (socket) socket.emit(EVENTS.REQUEST_DENIED, body)
    else this.mailerService.sendRequestDeniedMail(data)
  }
}
