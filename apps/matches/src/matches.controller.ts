import { Body, Controller, Get, Post } from '@nestjs/common'
import { MatchesService } from './matches.service'
import { Auth, ReqUser, Token, UserDocument } from '@lib/common'
import { CreateMatchDto } from './dtos/create-match.dto'

@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Post()
  @Auth({ types: ['manager'] })
  async httpCreateMatch(@Body() createMatchDto: CreateMatchDto, @ReqUser() user: UserDocument, @Token() token: string) {
    const match = await this.matchesService.create(createMatchDto, user, token)
    return { success: true, message: 'Match created successfully', data: { match } }
  }
}
