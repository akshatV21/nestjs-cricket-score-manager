import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import { CreateMatchDto } from './dtos/create-match.dto'
import { MatchRepository, TeamRepository, UserDocument } from '@lib/common'
import { EVENTS, MATCH_STATUS, MatchRequestedDto, SERVICES } from '@lib/utils'
import { Types } from 'mongoose'
import { ClientProxy } from '@nestjs/microservices'

@Injectable()
export class MatchesService {
  constructor(
    private readonly MatchRepository: MatchRepository,
    private readonly TeamRepository: TeamRepository,
    @Inject(SERVICES.NOTIFICATIONS_SERVICE) private notificationsService: ClientProxy,
    @Inject(SERVICES.CHATS_SERVICE) private chatsService: ClientProxy,
  ) {}

  async create({ opponentTeamId, format, time }: CreateMatchDto, user: UserDocument) {
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
        fromTeamName: fromTeam.name,
        fromManagerId: user._id,
        opponentManagerId: opponentTeam.manager,
        matchId: matchObjectId,
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
}
