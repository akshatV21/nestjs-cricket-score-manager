import { Controller, Get } from '@nestjs/common';
import { ChatsService } from './chats.service';

@Controller()
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Get()
  getHello(): string {
    return this.chatsService.getHello();
  }
}
