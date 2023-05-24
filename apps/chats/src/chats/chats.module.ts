import { Module } from '@nestjs/common'
import { ChatsController } from './chats.controller'
import { ChatsService } from './chats.service'
import {
  Chat,
  ChatRepository,
  ChatSchema,
  DatabaseModule,
  Team,
  TeamRepository,
  TeamSchema,
  User,
  UserRepository,
  UserSchema,
} from '@lib/common'

@Module({
  imports: [
    DatabaseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Team.name, schema: TeamSchema },
      { name: Chat.name, schema: ChatSchema },
    ]),
  ],
  controllers: [ChatsController],
  providers: [ChatsService, UserRepository, TeamRepository, ChatRepository],
})
export class ChatsModule {}
