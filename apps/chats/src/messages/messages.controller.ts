import { Body, Controller, Post } from '@nestjs/common'
import { MessagesService } from './messages.service'
import { Auth, ReqUser, UserDocument } from '@lib/common'
import { CreateMessageDto } from './dtos/create-message.dto'

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @Auth({ types: ['player', 'scorer', 'manager'] })
  async httpCreateNewMessage(@Body() createMessageDto: CreateMessageDto, @ReqUser() user: UserDocument) {
    await this.messagesService.create(createMessageDto, user)
    return { success: true, message: 'Message created successfully' }
  }
}
