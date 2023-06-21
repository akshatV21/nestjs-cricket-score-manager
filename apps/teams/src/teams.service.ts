import { BadRequestException, Inject, Injectable, InternalServerErrorException } from '@nestjs/common'
import { CreateTeamDto } from './dtos/create-team.dto'
import { TeamDocument, UserDocument, UserRepository } from '@lib/common'
import { TeamRepository } from '@lib/common/database/repositories/team.repository'
import { ProjectionType, QueryOptions, Types } from 'mongoose'
import { EVENTS, MatchEndedServiceDto, SERVICES, TEAMS_PAGINATION_LIMIT, TeamCreatedDto } from '@lib/utils'
import { RemovePlayerDto } from './dtos/remove-player.dto'
import { RemoveScorerDto } from './dtos/remove-scorer.dto'
import { UpdateNameDto } from './dtos/update-name.dto'
import { ClientProxy } from '@nestjs/microservices'

@Injectable()
export class TeamsService {
  constructor(
    private readonly TeamRepository: TeamRepository,
    private readonly UserRepository: UserRepository,
    @Inject(SERVICES.CHATS_SERVICE) private readonly ChatsService: ClientProxy,
  ) {}

  async create(createTeamDto: CreateTeamDto, user: UserDocument, token: string) {
    if (user.team) throw new BadRequestException('You are already a manager of another team.')

    const teamObjectId = new Types.ObjectId()
    const session = await this.UserRepository.startTransaction()

    try {
      const createTeamPromise = this.TeamRepository.create({ ...createTeamDto, manager: user._id }, teamObjectId)
      const updateUserPromise = this.UserRepository.update(user._id, { $set: { team: teamObjectId } })

      const [team] = await Promise.all([createTeamPromise, updateUserPromise])
      await session.commitTransaction()

      const payload: TeamCreatedDto = {
        body: { teamId: teamObjectId, managerId: user._id },
        token,
      }

      this.ChatsService.emit<any, TeamCreatedDto>(EVENTS.TEAM_CREATED, payload)
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
    const skipCount = (page - 1) * TEAMS_PAGINATION_LIMIT

    // update this projection and add these: nextMatch, statistics
    const projections: ProjectionType<TeamDocument> = { name: 1, manager: 1, scorer: 1 }
    const options: QueryOptions<TeamDocument> = {
      populate: { path: 'manager scorer', select: 'firstName lastName email' },
      skipCount,
      limit: TEAMS_PAGINATION_LIMIT,
    }

    const teams = await this.TeamRepository.find({}, projections, options)
    return teams
  }

  async removePlayer({ playerId }: RemovePlayerDto, user: UserDocument, token: string) {
    const session = await this.TeamRepository.startTransaction()

    try {
      const updateTeamPromise = this.TeamRepository.update(user.team, { $pull: { squad: playerId } })
      const updatePlayerPromise = this.UserRepository.update(playerId, { $set: { team: null } })

      await Promise.all([updateTeamPromise, updatePlayerPromise])
      await session.commitTransaction()
    } catch (error) {
      await session.abortTransaction()
      throw error
    }
  }

  async removeScorer({ scorerId }: RemoveScorerDto, user: UserDocument, token: string) {
    const session = await this.TeamRepository.startTransaction()

    try {
      const updateTeamPromise = this.TeamRepository.update(user.team, { $set: { scorer: null } })
      const updateScorerPromise = this.UserRepository.update(scorerId, { $set: { team: null } })

      await Promise.all([updateTeamPromise, updateScorerPromise])
      await session.commitTransaction()
    } catch (error) {
      await session.abortTransaction()
      throw error
    }
  }

  async updateName({ name }: UpdateNameDto, user: UserDocument) {
    await this.TeamRepository.update(user.team, { $set: { name } })
  }

  async updateUpcomingAndPLayedMatches({ body }: MatchEndedServiceDto) {}
}
