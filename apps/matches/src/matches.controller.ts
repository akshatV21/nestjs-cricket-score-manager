import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common'
import { MatchesService } from './matches.service'
import { Auth, ReqUser, Token, UserDocument } from '@lib/common'
import { CreateMatchDto } from './dtos/create-match.dto'
import { ParseObjectId } from '@lib/utils'
import { Types } from 'mongoose'

@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Post()
  @Auth({ types: ['manager'] })
  async httpCreateMatch(@Body() createMatchDto: CreateMatchDto, @ReqUser() user: UserDocument, @Token() token: string) {
    const match = await this.matchesService.create(createMatchDto, user, token)
    return { success: true, message: 'Match created successfully', data: { match } }
  }

  @Get(':matchId')
  @Auth({ types: ['player', 'scorer', 'manager'] })
  async httpGetMatchById(@Param('matchId', ParseObjectId) matchId: Types.ObjectId, @ReqUser() user: UserDocument) {
    const match = await this.matchesService.get(matchId, user)
    return { success: true, message: 'Match fetched successfully', data: { match } }
  }

  @Get('requests')
  @Auth({ types: ['manager'] })
  async httpGetTeamMatchRequests(@ReqUser() user: UserDocument) {
    const matches = await this.matchesService.listMatchRequests(new Types.ObjectId(user.team))
    return { success: true, message: 'Matches fetched successfully', data: { matches } }
  }

  @Get('upcoming')
  @Auth({ types: ['player', 'scorer', 'manager'] })
  async httpListUpcomingMatches(
    @Query('page', ParseIntPipe) page: number,
    @Query('teamId', ParseObjectId) teamId: Types.ObjectId,
  ) {
    const matches = await this.matchesService.listUpcomingMatches(page, teamId)
    return { success: true, message: 'Matches fetched successfully', data: { matches } }
  }

  @Get('live')
  @Auth({ types: ['player', 'scorer', 'manager'] })
  async httpListLiveMatches(
    @Query('page', ParseIntPipe) page: number,
    @Query('teamId', ParseObjectId) teamId: Types.ObjectId,
  ) {
    const matches = await this.matchesService.listLiveMatches(page, teamId)
    return { success: true, message: 'Matches fetched successfully', data: { matches } }
  }
}
