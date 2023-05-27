import { Module } from '@nestjs/common'
import { MessagesService } from './messages.service'
import { MessagesController } from './messages.controller'
import {
  Chat,
  ChatRepository,
  ChatSchema,
  DatabaseModule,
  Message,
  MessageRepository,
  MessageSchema,
  Team,
  TeamRepository,
  TeamSchema,
} from '@lib/common'
import { MessagesGateway } from './messages.gateway'
import { SocketSessions } from '@lib/utils'

@Module({
  imports: [
    DatabaseModule.forFeature([
      { name: Chat.name, schema: ChatSchema },
      { name: Message.name, schema: MessageSchema },
      { name: Team.name, schema: TeamSchema },
    ]),
  ],
  controllers: [MessagesController],
  providers: [MessagesService, ChatRepository, MessageRepository, MessagesGateway, SocketSessions, TeamRepository],
})
export class MessagesModule {}
