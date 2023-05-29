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
  User,
  UserRepository,
  UserSchema,
} from '@lib/common'
import { MessagesGateway } from './messages.gateway'
import { SocketSessions } from '@lib/utils'

@Module({
  imports: [
    DatabaseModule.forFeature([
      { name: Chat.name, schema: ChatSchema },
      { name: Message.name, schema: MessageSchema },
      { name: Team.name, schema: TeamSchema },
      { name: User.name, schema: UserSchema }
    ]),
  ],
  controllers: [MessagesController],
  providers: [MessagesService, ChatRepository, MessageRepository, MessagesGateway, SocketSessions, TeamRepository, UserRepository],
})
export class MessagesModule {}
