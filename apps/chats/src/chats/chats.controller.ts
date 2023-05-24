import { Body, Controller, Get, Post } from '@nestjs/common'
import { ChatsService } from './chats.service'
import { Auth, ReqUser, UserDocument } from '@lib/common'
import { CreateChatDto } from './dtos/create-chat.dto'
import { Token } from '@lib/common/auth/decorators/token.decorator'

@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Post()
  @Auth({ types: ['manager'] })
  async httpCreateChat(@Body() createChatDto: CreateChatDto, @ReqUser() user: UserDocument, @Token() token: string) {
    const chat = await this.chatsService.createBetweenTeamChat(createChatDto, user, token)
    return { success: true, message: 'Chat created successfully.', data: { chat } }
  }
}
