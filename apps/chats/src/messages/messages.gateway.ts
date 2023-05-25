import { Auth, Authorize, ChatRepository, MessageDocument, TeamRepository } from '@lib/common'
import {
  AuthenticatedSocket,
  AuthorizeDto,
  EVENTS,
  EXCEPTION_MSGS,
  JoinUserChatsDto,
  MessageCreatedDto,
  SERVICES,
  SocketSessions,
  catchAuthErrors,
} from '@lib/utils'
import { Inject, UseGuards } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { ClientProxy } from '@nestjs/microservices'
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets'
import { lastValueFrom } from 'rxjs'
import { Server } from 'socket.io'

@WebSocketGateway(8085, { namespace: 'messages' })
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly socketSessions: SocketSessions,
    @Inject(SERVICES.AUTH_SERVICE) private readonly authService: ClientProxy,
    private readonly TeamRepository: TeamRepository,
    private readonly ChatRepository: ChatRepository,
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

  @SubscribeMessage(EVENTS.JOIN_USER_CHAT_ROOMS)
  @Auth({ types: ['player', 'scorer', 'manager'] })
  @UseGuards(Authorize)
  async joinUserChatRooms(payload: JoinUserChatsDto) {
    const socket = this.socketSessions.getSocket(payload.userId)
    const chatRooms = [payload.teamChat]

    if (payload.userType === 'manager') {
      const team = await this.TeamRepository.findById(payload.teamId)
      team.chats.forEach(chat => chatRooms.push(chat.toString()))
    }

    socket.join(chatRooms)
  }

  @OnEvent(EVENTS.MSG_CREATED)
  handleMessageCreatedEvent(message: MessageDocument) {
    const forChatType = message.forChatType
    const senderId = forChatType === 'in-team' ? message.user : message.team

    const socket = this.socketSessions.getSocket(senderId)
    socket.to(`${message.chat}`).emit(EVENTS.MSG_CREATED, message)
  }
}
