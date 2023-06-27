import { Controller, Get, Req, UseGuards, UsePipes, ValidationPipe, Param } from '@nestjs/common'
import { PerformanceService } from './performance.service'
import { MessagePattern, Payload } from '@nestjs/microservices'
import { CreatePerformanceDto, EVENTS, NewBallPerformanceDto, ParseObjectId } from '@lib/utils'
import { Auth, Authorize } from '@lib/common'
import { Request } from 'express'
import { Types } from 'mongoose'

@Controller('performance')
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}

  @MessagePattern(EVENTS.TOSS_UPDATED)
  @Auth({ types: ['scorer'] })
  @UseGuards(Authorize)
  @UsePipes(new ValidationPipe({ transform: true }))
  handleTossUpdated(@Payload() createPerformaceDto: CreatePerformanceDto) {
    this.performanceService.createMatchPlayerPerformance(createPerformaceDto)
  }

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

  @Get(':performanceId')
  @Auth({ types: ['player', 'scorer', 'manager'] })
  async httpGetPerformance(@Param('performanceId', ParseObjectId) performanceId: Types.ObjectId) {
    const performance = await this.performanceService.get(performanceId)
    return { success: true, message: 'Fetched performance successfully', data: { performance } }
  }
}
