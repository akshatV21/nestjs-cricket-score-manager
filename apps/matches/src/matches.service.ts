import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import { CreateMatchDto } from './dtos/create-match.dto'
import { MatchDocument, MatchRepository, TeamRepository, UserDocument } from '@lib/common'
import { EVENTS, MATCH_STATUS, MatchRequestedDto, SERVICES, UPCOMING_MATCHES_LIMIT } from '@lib/utils'
import { FilterQuery, ProjectionType, QueryOptions, Types } from 'mongoose'
import { ClientProxy } from '@nestjs/microservices'

@Injectable()
export class MatchesService {
  constructor(
    private readonly MatchRepository: MatchRepository,
    private readonly TeamRepository: TeamRepository,
    @Inject(SERVICES.NOTIFICATIONS_SERVICE) private notificationsService: ClientProxy,
    @Inject(SERVICES.CHATS_SERVICE) private chatsService: ClientProxy,
  ) {}

  async create({ opponentTeamId, format, time }: CreateMatchDto, user: UserDocument, token: string) {
    const userTeamId = new Types.ObjectId(user.team)
    const matchRequestDate = `${time.getDate()}-${time.getMonth()}-${time.getFullYear()}`

    const bothTeamsUpcomingMatches = await this.MatchRepository.find({
      teams: { $elemMatch: { $in: [opponentTeamId, userTeamId] } },
      status: MATCH_STATUS.UPCOMING,
    })

    bothTeamsUpcomingMatches.forEach(match => {
      const matchTime = new Date(match.time)
      const matchScheduledDate = `${matchTime.getDate()}-${matchTime.getMonth()}-${matchTime.getFullYear()}`

      const pointingTeam = match.teams.includes(opponentTeamId) ? 'The other' : 'Your'
      if (matchRequestDate === matchScheduledDate)
        throw new BadRequestException(`${pointingTeam} team already has a match scheduled on the perticular day.`)
    })

    const matchObjectId = new Types.ObjectId()
    const session = await this.MatchRepository.startTransaction()

    try {
      const createMatchPromise = this.MatchRepository.create(
        { teams: [userTeamId, opponentTeamId], format, time, requestBy: userTeamId },
        matchObjectId,
      )
      const updateTeamOnePromise = this.TeamRepository.update(userTeamId, {
        $push: { upcomingMatches: matchObjectId },
      })
      const updateTeamTwoPromise = this.TeamRepository.update(opponentTeamId, {
        $push: { upcomingMatches: matchObjectId },
      })

      const [match, opponentTeam, fromTeam] = await Promise.all([
        createMatchPromise,
        updateTeamOnePromise,
        updateTeamTwoPromise,
      ])
      const payload: MatchRequestedDto = {
        body: {
          fromTeamName: fromTeam.name,
          fromManagerId: user._id,
          fromTeamId: fromTeam._id,
          opponentManagerId: opponentTeam.manager,
          opponentTeamId: opponentTeam._id,
          matchId: matchObjectId,
        },
        token,
      }

      this.chatsService.emit(EVENTS.MATCH_REQUESTED, payload)
      this.notificationsService.emit(EVENTS.MATCH_REQUESTED, payload)

      await session.commitTransaction()
      return match
    } catch (error) {
      await session.abortTransaction()
      throw error
    }
  }

  async get(matchId: Types.ObjectId, user: UserDocument) {
    const projections: ProjectionType<UserDocument> = {}
    const options: QueryOptions<UserDocument> = {
      populate: { path: 'teams squads.players', select: 'name firstName lastName email' },
    }

    return this.MatchRepository.findById(matchId, projections, options)
  }

  async listMatchRequests(teamId: string | Types.ObjectId) {
    const projections: ProjectionType<UserDocument> = {}
    const options: QueryOptions<UserDocument> = {
      populate: { path: 'teams', select: 'name' },
    }

    return this.MatchRepository.find(
      { teams: { $elemMatch: { $in: [teamId] } }, status: MATCH_STATUS.REQUESTED },
      projections,
      options,
    )
  }

  async listUpcomingMatches(page: number, teamId: Types.ObjectId) {
    const skip = (page - 1) / UPCOMING_MATCHES_LIMIT

    const query: FilterQuery<MatchDocument> = teamId
      ? { status: MATCH_STATUS.UPCOMING, teams: { $elemMatch: { $in: [teamId] } } }
      : { status: MATCH_STATUS.UPCOMING }
    const projections: ProjectionType<MatchDocument> = {}
    const options: QueryOptions<MatchDocument> = {
      populate: { path: 'teams squads.players', select: 'name firstName lastName email' },
      skip,
      limit: UPCOMING_MATCHES_LIMIT,
    }

    return this.MatchRepository.find(query, projections, options)
  }

  async listLiveMatches(page: number, teamId: Types.ObjectId) {
    const skip = (page - 1) / UPCOMING_MATCHES_LIMIT

    const query: FilterQuery<MatchDocument> = teamId
      ? {
          status: { $in: [MATCH_STATUS.LIVE, MATCH_STATUS.TOSS, MATCH_STATUS.INNINGS_BREAK] },
          teams: { $elemMatch: { $in: [teamId] } },
        }
      : { status: { $in: [MATCH_STATUS.LIVE, MATCH_STATUS.TOSS, MATCH_STATUS.INNINGS_BREAK] } }
    const projections: ProjectionType<MatchDocument> = {}
    const options: QueryOptions<MatchDocument> = {
      populate: { path: 'teams squads.players', select: 'name firstName lastName email' },
      skip,
      limit: UPCOMING_MATCHES_LIMIT,
    }

    return this.MatchRepository.find(query, projections, options)
  }
}
