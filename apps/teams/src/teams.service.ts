import { Injectable } from '@nestjs/common'
import { CreateTeamDto } from './dtos/create-team.dto'
import { UserDocument, UserRepository } from '@lib/common'
import { TeamRepository } from '@lib/common/database/repositories/team.repository'
import { Types } from 'mongoose'

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
}
