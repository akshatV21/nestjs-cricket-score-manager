import { Body, Controller, Post } from '@nestjs/common'
import { MessagesService } from './messages.service'
import { Auth, ChatRepository, ReqUser, UserDocument, UserRepository } from '@lib/common'
import { CreateMessageDto } from './dtos/create-message.dto'
import { OnEvent } from '@nestjs/event-emitter'
import { EVENTS, MatchRequestedDto, UserAddedToTeamMsgDto } from '@lib/utils'
import { Types } from 'mongoose'
import { EventPattern } from '@nestjs/microservices'
import { MessageBody } from '@nestjs/websockets'

@Controller('messages')
export class MessagesController {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly UserRepository: UserRepository,
    private readonly chatRepository: ChatRepository,
  ) {}

  @Post()
  @Auth({ types: ['player', 'scorer', 'manager'] })
  async httpCreateNewMessage(@Body() createMessageDto: CreateMessageDto, @ReqUser() user: UserDocument) {
    await this.messagesService.create(createMessageDto, user)
    return { success: true, message: 'Message created successfully' }
  }

  @OnEvent(EVENTS.USER_ADDED_TO_TEAM)
  async handleUserAddedToTeamEvent(data: UserAddedToTeamMsgDto) {
    const createMessageDto: CreateMessageDto = {
      chat: new Types.ObjectId(data.chatId),
      forChatType: 'in-team',
      type: 'annoucement',
      user: new Types.ObjectId(data.userId),
    }
    const user = await this.UserRepository.findById(data.userId)
    this.messagesService.create(createMessageDto, user)
  }

  @EventPattern(EVENTS.MATCH_REQUESTED)
  @Auth({ types: ['manager'] })
  async handleMatchRequestedEvent(@MessageBody() { body }: MatchRequestedDto) {
    const getChatPromise = this.chatRepository.findOne(
      {
        $or: [{ teams: [body.fromTeamId, body.opponentTeamId] }, { teams: [body.opponentTeamId, body.fromTeamId] }],
      },
      { _id: 1 },
    )
    const getUserPromise = this.UserRepository.findById(body.fromManagerId)
    const [chat, user] = await Promise.all([getChatPromise, getUserPromise])

    const createMessageDto: CreateMessageDto = {
      chat: chat._id,
      forChatType: 'between-team',
      type: 'match-request',
      user: new Types.ObjectId(body.fromManagerId),
      link: String(body.matchId),
    }
    this.messagesService.create(createMessageDto, user)
  }
}
