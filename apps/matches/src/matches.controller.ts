import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common'
import { MatchesService } from './matches.service'
import { Auth, MatchDocument, ReqUser, Token, UserDocument } from '@lib/common'
import { CreateMatchDto } from './dtos/create-match.dto'
import { NewBallDto, ParseObjectId } from '@lib/utils'
import { Types } from 'mongoose'
import { UpdateSquadDto } from './dtos/update-squad.dto'
import { UpdateMatchStatusDto } from './dtos/update-status.dto'
import { Match } from './decorators/match.decorator'
import { UpdateTossDto } from './dtos/update-toss.dto'
import { NewBatterDto } from './dtos/new-batter.dto'
import { IsMatchScorer } from './guards/is-match-scorer.guard'

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

  @Patch('schedule/:matchId')
  @Auth({ types: ['manager'] })
  async httpScheduleRequestedMatch(
    @Param('matchId', ParseObjectId) matchId: Types.ObjectId,
    @ReqUser() user: UserDocument,
    @Token() token: string,
  ) {
    await this.matchesService.schedule(matchId, user, token)
    return { success: true, message: 'Match scheduled successfully' }
  }

  @Patch('deny/:matchId')
  @Auth({ types: ['manager'] })
  async httpDenyRequestedMatch(
    @Param('matchId', ParseObjectId) matchId: Types.ObjectId,
    @ReqUser() user: UserDocument,
    @Token() token: string,
  ) {
    await this.matchesService.deny(matchId, user, token)
    return { success: true, message: 'Match request denied successfully' }
  }

  @Patch('squads')
  @Auth({ types: ['manager'] })
  async httpUpdateMatchSquad(
    @Body() updateSquadDto: UpdateSquadDto,
    @ReqUser() user: UserDocument,
    @Token() token: string,
  ) {
    await this.matchesService.squads(updateSquadDto, user, token)
    return { success: true, message: 'Match sqaud updated successfully' }
  }

  @Patch('status')
  @Auth({ types: ['scorer'] })
  @UseGuards(IsMatchScorer)
  async httpUpdateMatchStatus(@Body() updaeMatchStatusDto: UpdateMatchStatusDto, @Match() match: MatchDocument) {
    await this.matchesService.status(updaeMatchStatusDto, match)
    return { success: true, message: 'Match status updated successfully' }
  }

  @Patch('toss')
  @Auth({ types: ['scorer'] })
  @UseGuards(IsMatchScorer)
  async httpUpdateMatchToss(@Body() updateTossDto: UpdateTossDto, @Match() match: MatchDocument) {
    await this.matchesService.toss(updateTossDto, match)
    return { success: true, message: 'Match toss updated successfully' }
  }

  @Patch('newBall')
  @Auth({ types: ['scorer'] })
  @UseGuards(IsMatchScorer)
  async httpNewBallBowled(@Body() newBallDto: NewBallDto, @Match() match: MatchDocument, @Token() token: string) {
    await this.matchesService.newBallBowled(newBallDto, match, token)
    return { success: true, message: 'Match new ball updated successfully' }
  }

  @Patch('newBatter')
  @Auth({ types: ['scorer'] })
  @UseGuards(IsMatchScorer)
  async httpNewBatter(@Body() newBatterDto: NewBatterDto, @Match() match: MatchDocument) {
    const result = await this.matchesService.newBatter(newBatterDto, match)
    return { success: true, message: 'Match new batter updated successfully', data: { result } }
  }

  @Patch('endMatch')
  @Auth({ types: ['scorer'] })
  @UseGuards(IsMatchScorer)
  async httpEndMatch(@Match() match: MatchDocument, @Token() token: string) {
    await this.matchesService.endMatch(match, token)
    return { success: true, message: 'Match ended successfully' }
  }
}
