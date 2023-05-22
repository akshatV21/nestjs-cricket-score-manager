import { Injectable } from '@nestjs/common'
import { AbstractRepository } from '../abstract.repository'
import { Team, TeamDocument } from '../models'
import { InjectConnection, InjectModel } from '@nestjs/mongoose'
import { Connection, Model } from 'mongoose'

@Injectable()
export class TeamRepository extends AbstractRepository<TeamDocument, Team> {
  constructor(@InjectModel(Team.name) TeamModel: Model<TeamDocument>, @InjectConnection() connection: Connection) {
    super(TeamModel, connection)
  }
}
