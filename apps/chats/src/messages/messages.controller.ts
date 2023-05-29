import { Body, Controller, Post } from '@nestjs/common'
import { MessagesService } from './messages.service'
import { Auth, ReqUser, UserDocument, UserRepository } from '@lib/common'
import { CreateMessageDto } from './dtos/create-message.dto'
import { OnEvent } from '@nestjs/event-emitter'
import { EVENTS, UserAddedToTeamMsgDto } from '@lib/utils'
import { Types } from 'mongoose'

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService, private readonly UserRepository: UserRepository) {}

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
}
