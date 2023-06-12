import { Controller, Get, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common'
import { PerformanceService } from './performance.service'
import { MessagePattern, Payload } from '@nestjs/microservices'
import { EVENTS, NewBallPerformanceDto } from '@lib/utils'
import { Auth, Authorize } from '@lib/common'
import { Request } from 'express'

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

  @Get('list')
  @Auth({ types: ['player', 'scorer', 'manager'] })
  async httpListPerformances(@Req() req: Request) {
    const performances = await this.performanceService.list(req.query)
    return { success: true, message: 'Fetched performances successfully', data: { performances } }
  }
}
