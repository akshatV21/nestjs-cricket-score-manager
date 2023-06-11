import { Controller, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common'
import { PerformanceService } from './performance.service'
import { MessagePattern, Payload } from '@nestjs/microservices'
import { EVENTS, NewBallPerformanceDto } from '@lib/utils'
import { Auth, Authorize } from '@lib/common'

@Controller('performance')
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}

  @MessagePattern(EVENTS.NEW_BALL_BOWLED)
  @Auth({ types: ['scorer'] })
  @UseGuards(Authorize)
  @UsePipes(new ValidationPipe({ transform: true }))
  handleNewBallBowledMessage(@Payload() newBallPerformaceDto: NewBallPerformanceDto) {
    this.performanceService.newBallPerformance(newBallPerformaceDto)
  }
}
