import { Injectable } from '@nestjs/common'
import { AbstractRepository } from '../abstract.repository'
import { Performance, PerformanceDocument } from '../models'
import { InjectConnection, InjectModel } from '@nestjs/mongoose'
import { Connection, Model } from 'mongoose'

@Injectable()
export class PerformanceRepository extends AbstractRepository<PerformanceDocument, Performance> {
  constructor(
    @InjectModel(Performance.name) PerformanceModel: Model<PerformanceDocument>,
    @InjectConnection() connection: Connection,
  ) {
    super(PerformanceModel, connection)
  }
}
