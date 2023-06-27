import { Controller, Get, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common'
import { StatisticsService } from '../statistics/statistics.service'
import { MessagePattern, Payload } from '@nestjs/microservices'
import { CreateStatisticDto, EVENTS, UpdateStatisticsDto } from '@lib/utils'
import { Auth, Authorize } from '@lib/common'

@Controller()
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
}
