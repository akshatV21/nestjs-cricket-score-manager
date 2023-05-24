import { Injectable } from '@nestjs/common';

@Injectable()
export class ChatsService {
  getHello(): string {
    return 'Hello World!';
  }
}
