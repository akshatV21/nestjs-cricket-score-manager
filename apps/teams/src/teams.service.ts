import { Injectable } from '@nestjs/common'
import { CreateTeamDto } from './dtos/create-team.dto'
import { TeamDocument, UserDocument, UserRepository } from '@lib/common'
import { TeamRepository } from '@lib/common/database/repositories/team.repository'
import { ProjectionType, QueryOptions, Types } from 'mongoose'

@Injectable()
export class TeamsService {
  constructor(private readonly TeamRepository: TeamRepository, private readonly UserRepository: UserRepository) {}

  async create(createTeamDto: CreateTeamDto, user: UserDocument) {
    const teamObjectId = new Types.ObjectId()
    const createTeamPromise = this.TeamRepository.create({ ...createTeamDto, manager: user._id }, teamObjectId)
    const updateUserPromise = this.UserRepository.update(user._id, { $set: { team: teamObjectId } })

    const [team] = await Promise.all([createTeamPromise, updateUserPromise])
    return team
  }

  async get(teamId: Types.ObjectId, user: UserDocument) {
    const type = user.type
    const isTeamManager = type === 'manager' && teamId.equals(user.team)

    const projections: ProjectionType<TeamDocument> = isTeamManager ? {} : { invitations: 0 }
    const options: QueryOptions<TeamDocument> = isTeamManager
      ? {
          populate: {
            path: 'squad scorer',
            select: { squad: 'firstName lastName email', scorer: 'firstName lastName email' },
          },
        }
      : {
          populate: {
            path: 'manager scorer',
            select: { manager: 'firstName lastName email', scorer: 'firstName lastName email' },
          },
        }

    return this.TeamRepository.findById(teamId, projections, options)
  }

  async list(user: UserDocument) {
    const type = user.type
    // return teams
  }
}
