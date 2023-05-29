import { Injectable } from '@nestjs/common'
import { AbstractRepository } from '../abstract.repository'
import { Match, MatchDocument, Team, TeamDocument } from '../models'
import { InjectConnection, InjectModel } from '@nestjs/mongoose'
import { Connection, Model } from 'mongoose'

@Injectable()
export class MatchRepository extends AbstractRepository<MatchDocument, Match> {
  constructor(@InjectModel(Match.name) MatchModel: Model<MatchDocument>, @InjectConnection() connection: Connection) {
    super(MatchModel, connection)
  }
}
