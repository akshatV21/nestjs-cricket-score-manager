import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common'
import { ChatsService } from './chats.service'
import { Auth, ReqUser, Token, UserDocument } from '@lib/common'
import { CreateChatDto } from './dtos/create-chat.dto'
import { EVENTS, ParseObjectId, TeamCreatedDto, UserAddedToTeamDto } from '@lib/utils'
import { Types } from 'mongoose'
import { EventPattern, Payload } from '@nestjs/microservices'

@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Post()
  @Auth({ types: ['manager'] })
  async httpCreateChat(@Body() createChatDto: CreateChatDto, @ReqUser() user: UserDocument, @Token() token: string) {
    const chat = await this.chatsService.createBetweenTeamChat(createChatDto, user, token)
    return { success: true, message: 'Chat created successfully.', data: { chat } }
  }

  @Get()
  @Auth({ types: ['manager'] })
  async httpGetChatsList(@Query('page', ParseIntPipe) page: number, @ReqUser() user: UserDocument) {
    const chats = await this.chatsService.list(page, user)
    return { success: true, message: 'Chats fetched successfully.', data: { chats } }
  }

  @Get(':chatId')
  @Auth({ types: ['manager'] })
  async httpGetChat(@Param('chatId', ParseObjectId) chatId: Types.ObjectId, @ReqUser() user: UserDocument) {
    const chat = await this.chatsService.get(chatId, user)
    return { success: true, message: 'Chat fetched successfully.', data: { chat } }
  }

  @EventPattern(EVENTS.TEAM_CREATED)
  @Auth({ types: ['manager'] })
  handleTeamCreatedEvent(@Payload() payload: TeamCreatedDto) {
    this.chatsService.createInTeamChat(payload)
  }

  @EventPattern(EVENTS.USER_ADDED_TO_TEAM)
  @Auth({ types: ['player', 'scorer'] })
  handleUserAddedToTeamEvent(@Payload() payload: UserAddedToTeamDto) {
    this.chatsService.addUserToTeam(payload)
  }
}
