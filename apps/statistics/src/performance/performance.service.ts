import { PerformanceDocument, PerformanceRepository } from '@lib/common'
import { NewBallPerformanceDto } from '@lib/utils'
import { Injectable } from '@nestjs/common'
import { UpdateQuery } from 'mongoose'

@Injectable()
export class PerformanceService {
  constructor(private readonly PerformaceRepository: PerformanceRepository) {}

  async newBallPerformance({ body }: NewBallPerformanceDto) {
    const getBatterPromise = this.PerformaceRepository.findOne({ player: body.batter })
    const getBowlerPromise = this.PerformaceRepository.findOne({ player: body.bowler })
    const [batter, bowler] = await Promise.all([getBatterPromise, getBowlerPromise])

    const batterUpdateQuery: UpdateQuery<PerformanceDocument> = {
      $inc: {
        'batting.runs': body.runs,
        'batting.balls': 1,
        'batting.fours': body.isBoundary && body.runs === 4 ? 1 : 0,
        'batting.sixes': body.isBoundary && body.runs === 6 ? 1 : 0,
      },
      $set: {
        'batting.strikeRate': ((batter.batting.runs + body.runs) / (batter.batting.balls + 1)) * 100,
        'batting.isNotOut': body.isWicket ? false : true,
      },
    }

    let runsConceded = bowler.bowling.runsConceded + body.runs
    runsConceded += body.isNoBall ? 1 : 0
    runsConceded += body.isWide ? 1 : 0

    const noofBallsBowled = bowler.bowling.overs / 6 + bowler.bowling.balls + 1
    const updatedNoOfOvers = noofBallsBowled / 6

    const bowlerUpdateQuery: UpdateQuery<PerformanceDocument> = {
      $inc: {
        'bowling.noballs': body.isNoBall ? 1 : 0,
        'bowling.wides': body.isWide ? 1 : 0,
        'bowling.wickets': body.isWicket ? 1 : 0,
      },
      $set: {
        'bowling.overs': body.over,
        'bowling.balls': body.ball,
        'bowling.runsConceded': runsConceded,
        'bowling.economy': parseFloat((runsConceded / updatedNoOfOvers).toFixed(2)),
      },
    }

    const session = await this.PerformaceRepository.startTransaction()

    try {
      const updateBatterPromise = this.PerformaceRepository.updateByQuery({ player: batter._id }, batterUpdateQuery)
      const updateBowlerPromise = this.PerformaceRepository.updateByQuery({ player: bowler._id }, bowlerUpdateQuery)

      await Promise.all([updateBatterPromise, updateBowlerPromise])
      await session.commitTransaction()
    } catch (error) {
      await session.abortTransaction()
      throw error
    }
  }
}
