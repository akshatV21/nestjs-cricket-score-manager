import { StatisticRepository, UserRepository } from '@lib/common'
import { CreateStatisticDto } from '@lib/utils'
import { Injectable } from '@nestjs/common'
import { Types } from 'mongoose'

@Injectable()
export class StatisticsService {
  constructor(
    private readonly UserRepository: UserRepository,
    private readonly StatisticRepository: StatisticRepository,
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
}
