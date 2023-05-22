import { RequestDocument, RequestRepository, TeamRepository, UserDocument, UserRepository } from '@lib/common'
import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common'
import { CreateRequestDto } from '../dtos/create-request.dto'
import { FilterQuery, QueryOptions, Types } from 'mongoose'
import { REQUESTS_PAGINATION_LIMIT, REQUEST_STATUS, SQUAD_LIMIT } from '@lib/utils'
import { UpdateRequestDto } from '../dtos/update-request.dto'
import { skip } from 'rxjs'

@Injectable()
export class RequestsService {
  constructor(
    private readonly RequestRepository: RequestRepository,
    private readonly UserRepository: UserRepository,
    private readonly TeamRepository: TeamRepository,
  ) {}

  async create(createRequestDto: CreateRequestDto, user: UserDocument) {
    const teamId = new Types.ObjectId(user.team)
    const session = await this.RequestRepository.startTransaction()

    try {
      const getTeamPromise = this.TeamRepository.findById(teamId)
      const getUserPromise = this.UserRepository.findById(createRequestDto.user)

      const [team, toUser] = await Promise.all([getTeamPromise, getUserPromise])

      if (team.squad.length >= SQUAD_LIMIT && createRequestDto.type === 'player-join-request')
        throw new BadRequestException('Your squad already has 18 players.')

      if (team.scorer && createRequestDto.type === 'scorer-join-request')
        throw new BadRequestException('Your team already has a scorer.')

      if (createRequestDto.type === 'player-join-request' && toUser.type !== 'player')
        throw new BadRequestException('The user you requested is not a player.')

      if (createRequestDto.type === 'scorer-join-request' && toUser.type !== 'scorer')
        throw new BadRequestException('The user you requested is not a scorer.')

      const requestObjectId = new Types.ObjectId()
      const createRequestPromise = this.RequestRepository.create({ ...createRequestDto, team: teamId }, requestObjectId)

      team.requests.push(requestObjectId)
      toUser.requests.push(requestObjectId)

      const [request] = await Promise.all([createRequestPromise, team.save(), toUser.save()])
      await session.commitTransaction()

      return request
    } catch (error) {
      await session.abortTransaction()
      throw error
    }
  }

  async accept({ request, response, team }: UpdateRequestDto, user: UserDocument) {
    if (user.team) throw new BadRequestException('You are already in team.')

    const requestExists = user.requests.includes(request)
    if (!requestExists) throw new ForbiddenException('You are forbidden to make this request.')

    const teamUpdateObject = user.type === 'player' ? { $push: { squad: user._id } } : { $set: { scorer: user._id } }
    const session = await this.RequestRepository.startTransaction()

    try {
      const updateRequestPromise = this.RequestRepository.update(request, {
        $set: { status: REQUEST_STATUS.ACCEPTED, response },
      })
      const updateTeamPromise = this.TeamRepository.update(team, teamUpdateObject)
      const updateUserPromise = this.UserRepository.update(user._id, { $set: { team: team } })

      const [req] = await Promise.all([updateRequestPromise, updateTeamPromise, updateUserPromise])
      await session.commitTransaction()

      return req
    } catch (error) {
      await session.abortTransaction()
      throw error
    }
  }

  async deny({ request, response }: UpdateRequestDto, user: UserDocument) {
    const requestExists = user.requests.includes(request)
    if (!requestExists) throw new ForbiddenException('You are forbidden to make this request.')

    const req = await this.RequestRepository.update(request, { $set: { status: REQUEST_STATUS.DENIED, response } })
    return req
  }

  async get(requestId: Types.ObjectId, user: UserDocument) {
    const type = user.type
    const options: QueryOptions<RequestDocument> =
      type === 'manager'
        ? { populate: { path: 'user', select: 'firstName lastName email' } }
        : { populate: { path: 'manager', select: 'firstName lastName email' } }

    const request = await this.RequestRepository.findById(requestId, {}, options)
    return request
  }

  async list(page: number, user: UserDocument) {
    const type = user.type
    const skip = (page - 1) * REQUESTS_PAGINATION_LIMIT

    const query: FilterQuery<RequestDocument> = type === 'manager' ? { team: user.team } : { user: user._id }
    const options: QueryOptions<RequestDocument> =
      type === 'manager'
        ? { populate: { path: 'user', select: 'firstName lastName email' }, skip, limit: REQUESTS_PAGINATION_LIMIT }
        : { populate: { path: 'manager', select: 'firstName lastName email' }, skip, limit: REQUESTS_PAGINATION_LIMIT }

    const requests = await this.RequestRepository.find(query, {}, options)
    return requests
  }
}
