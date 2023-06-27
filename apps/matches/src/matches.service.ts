import { BadRequestException, ForbiddenException, Inject, Injectable } from '@nestjs/common'
import { CreateMatchDto } from './dtos/create-match.dto'
import { MatchDocument, MatchRepository, PerformanceRepository, TeamRepository, UserDocument, UserRepository } from '@lib/common'
import {
  CreatePerformanceDto,
  EVENTS,
  MATCH_SQUAD_LIMIT,
  MATCH_STATUS,
  MatchEndedDto,
  MatchEndedServiceDto,
  MatchRequestDeniedDto,
  MatchRequestedDto,
  MatchScheduledDto,
  MatchSquadUpdatedDto,
  MatchStatus,
  MatchStatusUpdatedDto,
  NewBallDto,
  NewBallPerformanceDto,
  SERVICES,
  TossUpdatedDto,
  UPCOMING_MATCHES_LIMIT,
  UpdateStatisticsDto,
  WonBy,
} from '@lib/utils'
import { FilterQuery, ProjectionType, QueryOptions, Types, UpdateQuery } from 'mongoose'
import { ClientProxy } from '@nestjs/microservices'
import { UpdateSquadDto } from './dtos/update-squad.dto'
import { UpdateMatchStatusDto } from './dtos/update-status.dto'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { UpdateTossDto } from './dtos/update-toss.dto'
import { NewBatterDto } from './dtos/new-batter.dto'
import { RescheduleMatchDto } from './dtos/reschedule-match.dto'

@Injectable()
export class MatchesService {
  constructor(
    private readonly MatchRepository: MatchRepository,
    private readonly TeamRepository: TeamRepository,
    private readonly PerformanceRepository: PerformanceRepository,
    private readonly UserRepository: UserRepository,
    @Inject(SERVICES.NOTIFICATIONS_SERVICE) private notificationsService: ClientProxy,
    @Inject(SERVICES.CHATS_SERVICE) private chatsService: ClientProxy,
    @Inject(SERVICES.STATISTICS_SERVICE) private readonly statisticsService: ClientProxy,
    @Inject(SERVICES.TEAMS_SERVICE) private readonly teamsService: ClientProxy,
    private readonly eventEmitter: EventEmitter2,
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

      const [match, opponentTeam, fromTeam] = await Promise.all([createMatchPromise, updateTeamOnePromise, updateTeamTwoPromise])
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

    return this.MatchRepository.find({ teams: { $elemMatch: { $in: [teamId] } }, status: MATCH_STATUS.REQUESTED }, projections, options)
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
          status: {
            $in: [MATCH_STATUS.FIRST_INNINGS, MATCH_STATUS.SECOND_INNINGS, MATCH_STATUS.TOSS, MATCH_STATUS.INNINGS_BREAK],
          },
          teams: { $elemMatch: { $in: [teamId] } },
        }
      : {
          status: {
            $in: [MATCH_STATUS.FIRST_INNINGS, MATCH_STATUS.SECOND_INNINGS, MATCH_STATUS.TOSS, MATCH_STATUS.INNINGS_BREAK],
          },
        }

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

    if (match.status !== 'requested') throw new BadRequestException('Cannot make this change with current match status.')

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

    if (match.status !== 'requested') throw new BadRequestException('Cannot make this change with current match status.')

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

    if (noOfPlayersAlreadyAdded >= MATCH_SQUAD_LIMIT) throw new BadRequestException('Your squad already consists of 11 players.')

    if (noOfPlayersToAdd > noOfPlayerSlotsRemaining)
      throw new BadRequestException(
        `Your squad already consists of ${noOfPlayersAlreadyAdded} players, so you can only add now ${noOfPlayerSlotsRemaining} players.`,
      )

    await this.MatchRepository.update(
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

  async status({ status }: UpdateMatchStatusDto, match: MatchDocument) {
    this.canUpdateStatus(match.status, status)
    await this.MatchRepository.update(match._id, { $set: { status } })

    const payload: MatchStatusUpdatedDto = { matchId: match._id.toString(), status }
    this.eventEmitter.emit(EVENTS.MATCH_STATUS_UPDATED, payload)
  }

  async toss(updateTossDto: UpdateTossDto, match: MatchDocument, token: string) {
    if (match.status !== 'toss') throw new BadRequestException('Cannot update toss when current match status in not - "TOSS"')

    await this.MatchRepository.update(match._id, {
      $set: {
        toss: {
          wonBy: updateTossDto.wonBy,
          called: updateTossDto.called,
          landed: updateTossDto.landed,
          elected: updateTossDto.elected,
        },
      },
    })

    const createPerformanceDto: CreatePerformanceDto = {
      token,
      body: {
        matchId: match._id,
        players: [...match.squads[0].players, ...match.squads[1].players],
      },
    }

    this.eventEmitter.emit(EVENTS.TOSS_UPDATED, updateTossDto)
    this.statisticsService.emit(EVENTS.TOSS_UPDATED, createPerformanceDto)
  }

  async newBallBowled(newBallDto: NewBallDto, match: MatchDocument, token: string) {
    if (match.status !== 'first-innings' && match.status !== 'second-innings')
      throw new BadRequestException('Cannot update new ball when current match is not - "first-innings" or "second-innings"')

    let score = newBallDto.runs
    score += newBallDto.isNoBall ? 1 : 0
    score += newBallDto.isWide ? 1 : 0

    const isWicket = newBallDto.isWicket && !newBallDto.isNoBall
    const currentInningsKey = match.status === 'first-innings' ? 'firstInnings' : 'secondInnings'
    const boundaryType = newBallDto.isBoundary && newBallDto.runs === 4 ? 'fours' : 'sixes'

    if (newBallDto.over < match[currentInningsKey].overs) throw new BadRequestException()

    const isOversLastBall = newBallDto.ball === 6
    const strikeHasChanged = newBallDto.runs % 2 !== 0
    const strikeChangedOnOversLastBall = strikeHasChanged && isOversLastBall

    const onStrikeBatterIndex = match.live.batters.findIndex(batter => batter.isOnStrike)
    const onStrikeBatterPerformanceId = match.live.batters[onStrikeBatterIndex].performance
    const onNonStrikeBatterPerformanceId = match.live.batters[onStrikeBatterIndex === 0 ? 1 : 0].performance
    const wicketOfBatterPerformanceId = match.live.batters.find(batter => newBallDto.batter.equals(batter.player))

    const ballUpdateQuery: UpdateQuery<MatchDocument> = {
      $inc: {
        [`${currentInningsKey}.runs`]: score,
        [`${currentInningsKey}.wickets`]: isWicket ? 1 : 0,
        [`${currentInningsKey}.noballs`]: newBallDto.isNoBall ? 1 : 0,
        [`${currentInningsKey}.wides`]: newBallDto.isWide ? 1 : 0,
        [`${currentInningsKey}.byes`]: newBallDto.isByes ? score : 0,
        [`${currentInningsKey}.fours`]: boundaryType === 'fours' ? 1 : 0,
        [`${currentInningsKey}.sixes`]: boundaryType === 'sixes' ? 1 : 0,
      },
      $set: {
        [`${currentInningsKey}.overs`]: newBallDto.over,
        [`${currentInningsKey}.balls`]: newBallDto.ball,
        [`${currentInningsKey}.live.batters.$[batterOnStrike].isOnStrike`]: strikeHasChanged
          ? strikeChangedOnOversLastBall
            ? true
            : false
          : isOversLastBall
          ? false
          : true,
        [`${currentInningsKey}.live.batters.$[batterOnNonStrike].isOnStrike`]: strikeHasChanged
          ? strikeChangedOnOversLastBall
            ? false
            : true
          : isOversLastBall
          ? true
          : false,
      },
    }

    if (newBallDto.isWicket) {
      ballUpdateQuery.$unset = { [`${currentInningsKey}.live.batters.$[wicketOfBatter]`]: '' }
    }

    const updateOptions: QueryOptions<MatchDocument> = {
      arrayFilters: [
        { 'batterOnStrike.performance': onStrikeBatterPerformanceId },
        { 'batterOnNonStrike.performance': onNonStrikeBatterPerformanceId },
        { 'wicketOfBatter.player': wicketOfBatterPerformanceId },
      ],
      new: true,
    }

    const updatedMatch = await this.MatchRepository.update(match._id, ballUpdateQuery, updateOptions)

    this.eventEmitter.emit(EVENTS.NEW_BALL_BOWLED, { ...newBallDto, batters: updatedMatch.live.batters })
    this.statisticsService.emit<any, NewBallPerformanceDto>(EVENTS.NEW_BALL_BOWLED, { token, body: newBallDto })
  }

  async newBatter(newBatterDto: NewBatterDto, match: MatchDocument) {
    if (match.status !== 'first-innings' && match.status !== 'second-innings')
      throw new BadRequestException('Cannot update new batter when current match is not - "first-innings" or "second-innings"')

    const noOfCurrentBatters = match.live.batters.length
    if (noOfCurrentBatters > 1) throw new BadRequestException('There are already 2 batters on the pitch.')

    const performanceId = await this.PerformanceRepository.exists({
      match: newBatterDto.matchId,
      player: newBatterDto.playerId,
    })
    if (!performanceId._id) throw new BadRequestException('There is no performace document for the player.')

    const currentInningsKey = match.status === 'first-innings' ? 'firstInnings' : 'secondInnings'
    const willNewBatterBeOnStrike = !match.live.batters[0].isOnStrike
    const noOfWickets = match[currentInningsKey].wickets

    const session = await this.MatchRepository.startTransaction()

    try {
      const updatePerformancePromise = this.PerformanceRepository.update(performanceId._id, {
        $set: {
          'batting.position': noOfWickets === 0 ? (noOfCurrentBatters === 0 ? 1 : 2) : noOfWickets + 2,
          'batting.didNotBat': false,
        },
      })
      const updateMatchPromise = this.MatchRepository.update(newBatterDto.matchId, {
        $push: {
          [`${currentInningsKey}.batting`]: performanceId._id,
          'live.batters': {
            performance: performanceId._id,
            player: newBatterDto.playerId,
            isOnStrike: willNewBatterBeOnStrike,
          },
        },
      })
      const updateUserPromise = this.UserRepository.update(newBatterDto.playerId, {
        $push: { performances: performanceId._id },
      })

      const [performance, updatedMatch] = await Promise.all([updatePerformancePromise, updateMatchPromise, updateUserPromise])
      await session.commitTransaction()

      return { performance, match: updatedMatch }
    } catch (error) {
      await session.abortTransaction()
      throw error
    }
  }

  async endMatch(match: MatchDocument, token: string) {
    let wonBy: WonBy

    const chasingTeamIsAllOut = match.secondInnings.wickets === 10
    const targetIsChased = match.firstInnings.runs + 1 <= match.secondInnings.runs
    const isEndOfInning = match.secondInnings.overs === 19 && match.secondInnings.balls === 6

    if (targetIsChased) wonBy = 'chasing'
    else if (chasingTeamIsAllOut || isEndOfInning) wonBy = 'defending'

    const resultObj = {
      wonBy,
      winningTeam: wonBy === 'chasing' ? match.secondInnings.team : match.firstInnings.team,
      runs: wonBy === 'defending' ? match.firstInnings.runs - match.secondInnings.runs : null,
      wickets: wonBy === 'chasing' ? 10 - match.secondInnings.wickets : null,
    }

    const matchUpdateQuery: UpdateQuery<MatchDocument> = {
      $set: { result: resultObj, status: MATCH_STATUS.FINISHED, live: null },
    }

    await this.MatchRepository.update(match._id, matchUpdateQuery)

    const eventEmitterPayload: MatchEndedDto = { matchId: match._id, ...resultObj }
    const teamServicePayload: MatchEndedServiceDto = { token, body: { matchId: match._id, teams: match.teams } }
    const statisticsServicePayload: UpdateStatisticsDto = {
      token,
      body: { matchId: match._id, players: [...match.squads[0].players, ...match.squads[1].players] },
    }

    this.eventEmitter.emit(EVENTS.MATCH_ENDED, eventEmitterPayload)
    this.teamsService.emit(EVENTS.MATCH_ENDED, teamServicePayload)
    this.statisticsService.emit(EVENTS.MATCH_ENDED, statisticsServicePayload)
  }

  async reschedule({ matchId, time }: RescheduleMatchDto, user: UserDocument) {
    const getTeamPromise = this.TeamRepository.findOne(user.team, { upcomingMatches: 1 })
    const getMatchPromise = this.MatchRepository.findById(matchId, { status: 1 })

    const [team, match] = await Promise.all([getTeamPromise, getMatchPromise])
    if (match.status !== 'upcoming') throw new BadRequestException('Cannot reschedule a match at this stage.')
    if (!team.upcomingMatches.includes(matchId)) throw new ForbiddenException('You cannot make this request.')

    await this.MatchRepository.update(matchId, { $set: { time, status: MATCH_STATUS.RESCHEDULED } })
  }

  private async canUpdateStatus(currentStatus: MatchStatus, updateToStatus: MatchStatus) {
    if (currentStatus === updateToStatus) throw new BadRequestException(`The match status is already set to the ${currentStatus}.`)

    if (updateToStatus === 'toss' && currentStatus !== 'requested')
      throw new BadRequestException(`Cannot change current match status of ${currentStatus} to ${updateToStatus}.`)

    if (updateToStatus === 'first-innings') {
      if (currentStatus !== 'toss' && currentStatus !== 'innings-break')
        throw new BadRequestException(`Cannot change current match status of ${currentStatus} to ${updateToStatus}.`)
    }
  }
}
