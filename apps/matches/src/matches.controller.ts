import { Controller, Get } from '@nestjs/common';
import { MatchesService } from './matches.service';

@Controller()
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Get()
  getHello(): string {
    return this.matchesService.getHello();
  }
}
