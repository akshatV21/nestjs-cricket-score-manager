import { BadRequestException, ForbiddenException, Inject, Injectable } from '@nestjs/common'
import { CreateMatchDto } from './dtos/create-match.dto'
import { MatchDocument, MatchRepository, TeamRepository, UserDocument } from '@lib/common'
import {
  EVENTS,
  MATCH_SQUAD_LIMIT,
  MATCH_STATUS,
  MatchRequestDeniedDto,
  MatchRequestedDto,
  MatchScheduledDto,
  MatchSquadUpdatedDto,
  SERVICES,
  UPCOMING_MATCHES_LIMIT,
} from '@lib/utils'
import { FilterQuery, ProjectionType, QueryOptions, Types, UpdateQuery } from 'mongoose'
import { ClientProxy } from '@nestjs/microservices'
import { UpdateSquadDto } from './dtos/update-squad.dto'

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
    const skipCount = (page - 1) / UPCOMING_MATCHES_LIMIT

    const query: FilterQuery<MatchDocument> = teamId
      ? { status: MATCH_STATUS.UPCOMING, teams: { $elemMatch: { $in: [teamId] } } }
      : { status: MATCH_STATUS.UPCOMING }

    const projections: ProjectionType<MatchDocument> = {}
    const options: QueryOptions<MatchDocument> = {
      populate: { path: 'teams squads.players', select: 'name firstName lastName email' },
      skipCount,
      limit: UPCOMING_MATCHES_LIMIT,
    }

    return this.MatchRepository.find(query, projections, options)
  }

  async listLiveMatches(page: number, teamId: Types.ObjectId) {
    const skipCount = (page - 1) / UPCOMING_MATCHES_LIMIT

    const query: FilterQuery<MatchDocument> = teamId
      ? {
          status: { $in: [MATCH_STATUS.LIVE, MATCH_STATUS.TOSS, MATCH_STATUS.INNINGS_BREAK] },
          teams: { $elemMatch: { $in: [teamId] } },
        }
      : { status: { $in: [MATCH_STATUS.LIVE, MATCH_STATUS.TOSS, MATCH_STATUS.INNINGS_BREAK] } }

    const projections: ProjectionType<MatchDocument> = {}
    const options: QueryOptions<MatchDocument> = {
      populate: { path: 'teams squads.players', select: 'name firstName lastName email' },
      skipCount,
      limit: UPCOMING_MATCHES_LIMIT,
    }

    return this.MatchRepository.find(query, projections, options)
  }

  async schedule(matchId: Types.ObjectId, user: UserDocument, token: string) {
    const match = await this.MatchRepository.findById(matchId, {}, { lean: true })

    if (!match.teams.includes(user.team) || user._id.equals(match.requestBy))
      throw new ForbiddenException('You are not authorized to make this request')

    if (match.status !== 'requested')
      throw new BadRequestException('Cannot make this change with current match status.')

    const userTeamId = new Types.ObjectId(user.team)
    const opponentTeamId = new Types.ObjectId(match.requestBy)

    const requestMatchTime = new Date(match.time)
    const matchRequestDate = `${requestMatchTime.getDate()}-${requestMatchTime.getMonth()}-${requestMatchTime.getFullYear()}`

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

    const getUserTeamPromise = this.TeamRepository.findById(userTeamId, { name: 1 }, { lean: true })
    const getOpponentTeamPromise = this.TeamRepository.findById(opponentTeamId, { name: 1 }, { lean: true })
    const updateMatchPromise = this.MatchRepository.update(matchId, { $set: { status: MATCH_STATUS.UPCOMING } })

    const [userTeam, opponentTeam] = await Promise.all([getUserTeamPromise, getOpponentTeamPromise, updateMatchPromise])

    const payload: MatchScheduledDto = {
      body: {
        fromManagerId: user._id,
        fromTeamId: userTeamId,
        fromTeamName: userTeam.name,
        opponentManagerId: opponentTeam.manager,
        opponentTeamId: opponentTeamId,
        matchId,
      },
      token,
    }

    this.notificationsService.emit(EVENTS.MATCH_SCHEDULED, payload)
    this.chatsService.emit(EVENTS.MATCH_SCHEDULED, payload)
  }

  async deny(matchId: Types.ObjectId, user: UserDocument, token: string) {
    const match = await this.MatchRepository.findById(matchId, {}, { lean: true })

    if (!match.teams.includes(user.team) || user._id.equals(match.requestBy))
      throw new ForbiddenException('You are not authorized to make this request')

    if (match.status !== 'requested')
      throw new BadRequestException('Cannot make this change with current match status.')

    const opponentTeamId = new Types.ObjectId(match.requestBy)
    const userTeamId = new Types.ObjectId(user.team)

    const getUserTeamPromise = this.TeamRepository.findById(userTeamId, { name: 1 }, { lean: true })
    const getOpponentTeamPromise = this.TeamRepository.findById(opponentTeamId, { name: 1 }, { lean: true })
    const updateMatchPromise = this.MatchRepository.update(matchId, { $set: { status: MATCH_STATUS.DENIED } })

    const [userTeam, opponentTeam] = await Promise.all([getUserTeamPromise, getOpponentTeamPromise, updateMatchPromise])

    const payload: MatchRequestDeniedDto = {
      body: {
        fromManagerId: user._id,
        fromTeamId: userTeamId,
        fromTeamName: userTeam.name,
        opponentManagerId: opponentTeam.manager,
        opponentTeamId: opponentTeamId,
        matchId,
      },
      token,
    }

    this.notificationsService.emit(EVENTS.MATCH_REQUEST_DENIED, payload)
    this.chatsService.emit(EVENTS.MATCH_REQUEST_DENIED, payload)
  }

  async squads({ matchId, players }: UpdateSquadDto, user: UserDocument, token: string) {
    const getTeamPromise = this.TeamRepository.findById(user.team, {}, { lean: true })
    const getMatchPromise = this.MatchRepository.findById(matchId, {}, { lean: true })

    const [team, match] = await Promise.all([getTeamPromise, getMatchPromise])

    if (!match.teams.includes(user.team)) throw new ForbiddenException('You are not allowed to make this request.')

    const noOfPlayersToAdd = players.length
    const noOfPlayersAlreadyAdded = match.squads.find(squad => squad.team === user.team).players.length
    const noOfPlayerSlotsRemaining = MATCH_SQUAD_LIMIT - noOfPlayersAlreadyAdded

    if (noOfPlayersAlreadyAdded >= MATCH_SQUAD_LIMIT)
      throw new BadRequestException('Your squad already consists of 11 players.')

    if (noOfPlayersToAdd > noOfPlayerSlotsRemaining)
      throw new BadRequestException(
        `Your squad already consists of ${noOfPlayersAlreadyAdded} players, so you can only add now ${noOfPlayerSlotsRemaining} players.`,
      )

    this.MatchRepository.update(
      matchId,
      { $push: { 'squads.$[squad].players': { $each: players } } },
      { arrayFilters: [{ 'squad.team': team._id }], new: true },
    )

    const payload: MatchSquadUpdatedDto = {
      body: {
        userTeam: user.team,
        opponentTeam: match.teams.find(id => user.team !== id),
      },
      token,
    }

    this.notificationsService.emit(EVENTS.MATCH_SQUAD_UPDATED, payload)
  }
}
