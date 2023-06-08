import { Auth } from '@lib/common'
import {
  AuthenticatedSocket,
  AuthorizeDto,
  EVENTS,
  EXCEPTION_MSGS,
  MatchStatusUpdatedDto,
  SERVICES,
  SocketSessions,
  catchAuthErrors,
} from '@lib/utils'
import { Inject } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { ClientProxy } from '@nestjs/microservices'
import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from '@nestjs/websockets'
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

  @SubscribeMessage(EVENTS.JOIN_LIVE_MATCHES)
  @Auth({ types: ['player', 'scorer', 'manager'] })
  handleJoinLiveMatchesEvent(@MessageBody() { userId }: Record<'userId', string>) {
    const liveMatches = [...this.server.of('/').adapter.rooms].map(([name, value]) => name)
    const socket = this.socketSessions.getSocket(userId)

    if (socket) socket.join(liveMatches)
  }

  @OnEvent(EVENTS.NEW_LIVE_MATCH)
  handleNewLiveMatchEvent({ matchId, status }: MatchStatusUpdatedDto) {
    if (status !== 'toss') return
    const sockets = this.socketSessions.getSockets()
    sockets.forEach(socket => socket.join(matchId as string))
    this.server.emit(EVENTS.NEW_LIVE_MATCH, { matchId, status })
  }
}
