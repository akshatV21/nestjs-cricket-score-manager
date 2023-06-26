import { Injectable } from '@nestjs/common'
import { AbstractRepository } from '../abstract.repository'
import { Statistic, StatisticDocument, Team, TeamDocument } from '../models'
import { InjectConnection, InjectModel } from '@nestjs/mongoose'
import { Connection, Model } from 'mongoose'

@Injectable()
export class StatisticRepository extends AbstractRepository<StatisticDocument, Statistic> {
  constructor(
    @InjectModel(Statistic.name) StatisticModel: Model<StatisticDocument>,
    @InjectConnection() connection: Connection,
  ) {
    super(StatisticModel, connection)
  }
}
