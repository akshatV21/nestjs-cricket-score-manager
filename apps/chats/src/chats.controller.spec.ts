import { Test, TestingModule } from '@nestjs/testing';
import { ChatsController } from './chats.controller';
import { ChatsService } from './chats.service';

describe('ChatsController', () => {
  let chatsController: ChatsController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ChatsController],
      providers: [ChatsService],
    }).compile();

    chatsController = app.get<ChatsController>(ChatsController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(chatsController.getHello()).toBe('Hello World!');
    });
  });
});
