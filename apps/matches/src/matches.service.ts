import { Injectable } from '@nestjs/common';

@Injectable()
export class MatchesService {
  getHello(): string {
    return 'Hello World!';
  }
}
