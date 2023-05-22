import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common'
import { CreateTeamDto } from './dtos/create-team.dto'
import { TeamDocument, UserDocument, UserRepository } from '@lib/common'
import { TeamRepository } from '@lib/common/database/repositories/team.repository'
import { ProjectionType, QueryOptions, Types } from 'mongoose'
import { TEAMS_PAGINATION_LIMIT } from '@lib/utils'

@Injectable()
export class TeamsService {
  constructor(private readonly TeamRepository: TeamRepository, private readonly UserRepository: UserRepository) {}

  async create(createTeamDto: CreateTeamDto, user: UserDocument) {
    if (user.team) throw new BadRequestException('You are already a manager of another team.')

    const teamObjectId = new Types.ObjectId()
    const session = await this.UserRepository.startTransaction()

    try {
      const createTeamPromise = this.TeamRepository.create({ ...createTeamDto, manager: user._id }, teamObjectId)
      const updateUserPromise = this.UserRepository.update(user._id, { $set: { team: teamObjectId } })

      const [team] = await Promise.all([createTeamPromise, updateUserPromise])
      await session.commitTransaction()

      return team
    } catch (error) {
      await session.abortTransaction()
      throw error
    }
  }

  async get(teamId: Types.ObjectId, user: UserDocument) {
    const type = user.type
    const isTeamManager = type === 'manager' && teamId.equals(user.team)

    const projections: ProjectionType<TeamDocument> = isTeamManager ? {} : { requests: 0 }
    const options: QueryOptions<TeamDocument> = isTeamManager
      ? { populate: { path: 'squad scorer', select: 'firstName lastName email' } }
      : { populate: { path: 'manager scorer squad', select: 'firstName lastName email' } }

    return this.TeamRepository.findById(teamId, projections, options)
  }

  async list(page: number) {
    const skip = (page - 1) * TEAMS_PAGINATION_LIMIT

    // update this projection and add these: nextMatch, statistics
    const projections: ProjectionType<TeamDocument> = { name: 1, manager: 1, scorer: 1 }
    const options: QueryOptions<TeamDocument> = {
      populate: { path: 'manager scorer', select: 'firstName lastName email' },
      skip,
      limit: TEAMS_PAGINATION_LIMIT,
    }

    const teams = await this.TeamRepository.find({}, projections, options)
    return teams
  }
}
