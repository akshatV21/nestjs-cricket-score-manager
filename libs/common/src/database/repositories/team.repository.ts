import { Injectable } from '@nestjs/common'
import { AbstractRepository } from '../abstract.repository'
import { Team, TeamDocument } from '../models'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

@Injectable()
export class TeamRepository extends AbstractRepository<TeamDocument, Team> {
  constructor(@InjectModel(Team.name) TeamModel: Model<TeamDocument>) {
    super(TeamModel)
  }
}
