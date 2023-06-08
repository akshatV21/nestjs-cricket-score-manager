import {
  AuthenticatedSocket,
  AuthorizeDto,
  EVENTS,
  EXCEPTION_MSGS,
  SERVICES,
  SocketSessions,
  catchAuthErrors,
} from '@lib/utils'
import { Inject } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { WebSocketGateway, WebSocketServer, WsException } from '@nestjs/websockets'
import { lastValueFrom } from 'rxjs'
import { Server } from 'socket.io'

@WebSocketGateway(8087, { namespace: 'matches', cors: { origin: '*' } })
export class MatchesGateway {
  constructor(
    private socketSessions: SocketSessions,
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
}
