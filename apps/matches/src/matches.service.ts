import { BadRequestException, Injectable } from '@nestjs/common'
import { CreateMatchDto } from './dtos/create-match.dto'
import { MatchRepository, TeamRepository, UserDocument } from '@lib/common'
import { MATCH_STATUS } from '@lib/utils'
import { Types } from 'mongoose'

@Injectable()
export class MatchesService {
  constructor(private readonly MatchRepository: MatchRepository, private readonly TeamRepository: TeamRepository) {}

  async create({ toTeamId, format, time }: CreateMatchDto, user: UserDocument) {
    const userTeamId = new Types.ObjectId(user.team)
    const matchRequestDate = `${time.getDate()}-${time.getMonth()}-${time.getFullYear()}`

    const bothTeamsUpcomingMatches = await this.MatchRepository.find({
      teams: { $elemMatch: { $in: [toTeamId, userTeamId] } },
      status: MATCH_STATUS.UPCOMING,
    })

    bothTeamsUpcomingMatches.forEach(match => {
      const matchTime = new Date(match.time)
      const matchScheduledDate = `${matchTime.getDate()}-${matchTime.getMonth()}-${matchTime.getFullYear()}`

      const pointingTeam = match.teams.includes(toTeamId) ? 'The other' : 'Your'
      if (matchRequestDate === matchScheduledDate)
        throw new BadRequestException(`${pointingTeam} team already has a match scheduled on the perticular day.`)
    })

    const matchObjectId = new Types.ObjectId()
    const session = await this.MatchRepository.startTransaction()

    try {
      const createMatchPromise = this.MatchRepository.create(
        { teams: [userTeamId, toTeamId], format, time, requestBy: userTeamId },
        matchObjectId,
      )
      const updateTeamOnePromise = this.TeamRepository.update(userTeamId, {
        $push: { upcomingMatches: matchObjectId },
      })
      const updateTeamTwoPromise = this.TeamRepository.update(toTeamId, {
        $push: { upcomingMatches: matchObjectId },
      })

      const match = await Promise.all([createMatchPromise, updateTeamOnePromise, updateTeamTwoPromise])
      await session.commitTransaction()

      return match
    } catch (error) {
      await session.abortTransaction()
      throw error
    }
  }
}
