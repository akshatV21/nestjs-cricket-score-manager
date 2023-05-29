import { Test, TestingModule } from '@nestjs/testing';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';

describe('MatchesController', () => {
  let matchesController: MatchesController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [MatchesController],
      providers: [MatchesService],
    }).compile();

    matchesController = app.get<MatchesController>(MatchesController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(matchesController.getHello()).toBe('Hello World!');
    });
  });
});
