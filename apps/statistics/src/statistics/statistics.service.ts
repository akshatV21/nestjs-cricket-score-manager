import { PerformanceDocument, PerformanceRepository, StatisticDocument, StatisticRepository, UserRepository } from '@lib/common'
import { CreateStatisticDto, UpdateStatisticsDto } from '@lib/utils'
import { Injectable } from '@nestjs/common'
import { Types, UpdateQuery } from 'mongoose'

@Injectable()
export class StatisticsService {
  constructor(
    private readonly UserRepository: UserRepository,
    private readonly StatisticRepository: StatisticRepository,
    private readonly PerformanceRepository: PerformanceRepository,
  ) {}

  async create({ body }: CreateStatisticDto) {
    const statisticObjectId = new Types.ObjectId()
    const session = await this.StatisticRepository.startTransaction()

    try {
      const createStatisticPromise = this.StatisticRepository.create({ player: body.playerId }, statisticObjectId)
      const updateUserPromise = this.UserRepository.update(body.playerId, { $set: { statistics: statisticObjectId } })

      await Promise.all([createStatisticPromise, updateUserPromise])
      await session.commitTransaction()

      return statisticObjectId
    } catch (error) {
      session.abortTransaction()
      throw error
    }
  }

  async calculate({ body }: UpdateStatisticsDto) {
    const getPlayerStatisticsPromises: Promise<[StatisticDocument, PerformanceDocument]>[] = []
    const updateStatisticsPromises: Promise<StatisticDocument>[] = []

    for (const playerId of body.players) {
      const getPlayerStatisticsPromise = Promise.all([
        this.StatisticRepository.findOne({ player: playerId }),
        this.PerformanceRepository.findOne({ playerId, match: body.matchId }),
      ])
      getPlayerStatisticsPromises.push(getPlayerStatisticsPromise)
    }

    const playerStatistics = await Promise.all(getPlayerStatisticsPromises)

    for (const [stats, performance] of playerStatistics) {
      const newNoOfInnings = performance.batting.didNotBat ? stats.batting.innings : stats.batting.innings + 1
      const newNoOfNotOuts = performance.batting.isNotOut ? stats.batting.notOuts + 1 : stats.batting.notOuts
      const newBattingAverage = (stats.batting.runs + performance.batting.runs) / newNoOfInnings - newNoOfNotOuts
      const newStrikeRate = ((stats.batting.runs + performance.batting.runs) / (stats.batting.balls + performance.batting.balls)) * 100

      const newBowlingAverage =
        (stats.bowling.runsConceded + performance.bowling.runsConceded) / (stats.bowling.wickets + performance.bowling.wickets)
      const totalBalls = (stats.bowling.balls / 6 + performance.bowling.overs) * 6 + (stats.bowling.balls % 6) + performance.bowling.balls
      const newEconomy = (stats.bowling.runsConceded + performance.bowling.runsConceded) / Math.floor(totalBalls / 6)

      const updateQuery: UpdateQuery<StatisticDocument> = {
        $set: {
          'batting.innings': newNoOfInnings,
          'batting.notOuts': newNoOfNotOuts,
          'batting.average': newBattingAverage,
          'batting.strikeRate': newStrikeRate,
          'bowling.average': newBowlingAverage,
          'bowling.economy': newEconomy,
        },
        $inc: {
          'batting.runs': performance.batting.runs,
          'batting.balls': performance.batting.balls,
          'batting.fours': performance.batting.fours,
          'batting.sixes': performance.batting.sixes,
          'bowling.balls': performance.bowling.balls,
          'bowling.runsConceded': performance.bowling.runsConceded,
          'bowling.wickets': performance.bowling.wickets,
          'bowling.noballs': performance.bowling.noballs,
          'bowling.wides': performance.bowling.wides,
        },
      }

      const updateStatisticPromise = this.StatisticRepository.update(stats._id, updateQuery)
      updateStatisticsPromises.push(updateStatisticPromise)
    }

    await Promise.all(updateStatisticsPromises)
  }
}
