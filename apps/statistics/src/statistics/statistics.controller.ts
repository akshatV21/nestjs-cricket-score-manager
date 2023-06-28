import { Controller, Get, Query, UseGuards, UsePipes, ValidationPipe, Param } from '@nestjs/common'
import { StatisticsService } from '../statistics/statistics.service'
import { MessagePattern, Payload } from '@nestjs/microservices'
import { BatterStats, BowlerStats, CreateStatisticDto, EVENTS, ParseObjectId, UpdateStatisticsDto } from '@lib/utils'
import { Auth, Authorize } from '@lib/common'
import { Types } from 'mongoose'

@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @MessagePattern(EVENTS.USER_EMAIL_VALIDATED)
  @Auth({ types: ['player'] })
  @UseGuards(Authorize)
  @UsePipes(new ValidationPipe({ transform: true }))
  handleUserEmailValidatedEvent(@Payload() createStatisticDto: CreateStatisticDto) {
    this.statisticsService.create(createStatisticDto)
  }

  @MessagePattern(EVENTS.MATCH_ENDED)
  @Auth({ types: ['player'] })
  @UseGuards(Authorize)
  @UsePipes(new ValidationPipe({ transform: true }))
  handleMatchEndedEvent(@Payload() updateStatisticsDto: UpdateStatisticsDto) {
    this.statisticsService.calculate(updateStatisticsDto)
  }

  @Get()
  @Auth({ types: ['player', 'scorer', 'manager'] })
  async httpGetSinglePlayerStatistics(@Query('playerId', ParseObjectId) playerId: Types.ObjectId) {
    const statistics = await this.statisticsService.getSinglePlayerStatistics(playerId)
    return { success: true, message: 'Player statistics fetched successfully.', data: { statistics } }
  }

  @Get('batters/:stat')
  @Auth({ types: ['player', 'scorer', 'manager'] })
  async httpGetBatterStatistics(@Param('stat') stat: BatterStats, @Query('page') page: number) {
    const statistics = await this.statisticsService.getPlayerStatistics(stat, page, 'batting')
    return { success: true, message: 'Batter statistics fetched successfully.', data: { statistics } }
  }

  @Get('bowlers/:stat')
  @Auth({ types: ['player', 'scorer', 'manager'] })
  async httpGetBowlerStatistics(@Param('stat') stat: BowlerStats, @Query('page') page: number) {
    const statistics = await this.statisticsService.getPlayerStatistics(stat, page, 'bowling')
    return { success: true, message: 'Bowler statistics fetched successfully.', data: { statistics } }
  }
}
