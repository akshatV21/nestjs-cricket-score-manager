import { RequestDocument, RequestRepository, TeamRepository, UserDocument, UserRepository } from '@lib/common'
import { BadRequestException, ForbiddenException, Inject, Injectable } from '@nestjs/common'
import { CreateRequestDto } from '../dtos/create-request.dto'
import { FilterQuery, QueryOptions, Types } from 'mongoose'
import {
  EVENTS,
  REQUESTS_PAGINATION_LIMIT,
  REQUEST_STATUS,
  RequestAcceptedDto,
  RequestCreatedDto,
  RequestDeniedDto,
  SERVICES,
  SQUAD_LIMIT,
  UserAddedToTeamDto,
} from '@lib/utils'
import { UpdateRequestDto } from '../dtos/update-request.dto'
import { ClientProxy } from '@nestjs/microservices'

@Injectable()
export class RequestsService {
  constructor(
    private readonly RequestRepository: RequestRepository,
    private readonly UserRepository: UserRepository,
    private readonly TeamRepository: TeamRepository,
    @Inject(SERVICES.NOTIFICATIONS_SERVICE) private readonly notificationsService: ClientProxy,
    @Inject(SERVICES.CHATS_SERVICE) private readonly chatsService: ClientProxy,
  ) {}

  async create(createRequestDto: CreateRequestDto, user: UserDocument, token: string) {
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

      if (createRequestDto.type === 'player-join-request' && team.squad.includes(createRequestDto.user))
        throw new BadRequestException('Player already exists in your squad.')

      if (createRequestDto.type === 'player-join-request' && toUser._id.equals(team.scorer))
        throw new BadRequestException('This scorer is already assigned to your team.')

      const requestObjectId = new Types.ObjectId()
      const createRequestPromise = this.RequestRepository.create({ ...createRequestDto, team: teamId }, requestObjectId)

      team.requests.push(requestObjectId)
      toUser.requests.push(requestObjectId)

      const [request] = await Promise.all([createRequestPromise, team.save(), toUser.save()])
      await session.commitTransaction()

      const payload: RequestCreatedDto = {
        body: {
          userId: toUser._id,
          userEmail: toUser.email,
          teamName: team.name,
          requestId: requestObjectId,
          requestType: createRequestDto.type,
        },
        token,
      }

      this.notificationsService.emit<any, RequestCreatedDto>(EVENTS.REQUEST_CREATED, payload)
      return request
    } catch (error) {
      await session.abortTransaction()
      throw error
    }
  }

  async accept({ request, response, team }: UpdateRequestDto, user: UserDocument, token: string) {
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

      const [req, teamDoc, userDoc] = await Promise.all([updateRequestPromise, updateTeamPromise, updateUserPromise])
      await session.commitTransaction()

      const notificationsPayload: RequestAcceptedDto = {
        body: {
          managerId: teamDoc.manager,
          userName: `${userDoc.firstName} ${userDoc.lastName}`,
          teamName: teamDoc.name,
          requestId: request,
          requestType: req.type,
        },
        token,
      }

      const chatsPayload: UserAddedToTeamDto = {
        body: { teamId: team, userId: user._id },
        token,
      }

      this.chatsService.emit<any, UserAddedToTeamDto>(EVENTS.USER_ADDED_TO_TEAM, chatsPayload)
      this.notificationsService.emit<any, RequestAcceptedDto>(EVENTS.REQUEST_ACCEPTED, notificationsPayload)

      return req
    } catch (error) {
      await session.abortTransaction()
      throw error
    }
  }

  async deny({ request, response, team }: UpdateRequestDto, user: UserDocument, token: string) {
    const requestExists = user.requests.includes(request)
    if (!requestExists) throw new ForbiddenException('You are forbidden to make this request.')

    const getTeamPromise = this.TeamRepository.findById(team)
    const updateRequestPromise = this.RequestRepository.update(request, {
      $set: { status: REQUEST_STATUS.DENIED, response },
    })

    const [req, teamDoc] = await Promise.all([updateRequestPromise, getTeamPromise])

    const payload: RequestDeniedDto = {
      body: {
        requestId: req._id,
        requestType: req.type,
        userName: `${user.firstName} ${user.lastName}`,
        teamName: teamDoc.name,
        managerId: teamDoc.manager,
      },
      token,
    }

    this.notificationsService.emit<any, RequestDeniedDto>(EVENTS.REQUEST_DENIED, payload)
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
    const skipCount = (page - 1) * REQUESTS_PAGINATION_LIMIT

    const query: FilterQuery<RequestDocument> = type === 'manager' ? { team: user.team } : { user: user._id }
    const options: QueryOptions<RequestDocument> =
      type === 'manager'
        ? {
            populate: { path: 'user', select: 'firstName lastName email' },
            skipCount,
            limit: REQUESTS_PAGINATION_LIMIT,
          }
        : {
            populate: { path: 'manager', select: 'firstName lastName email' },
            skipCount,
            limit: REQUESTS_PAGINATION_LIMIT,
          }

    const requests = await this.RequestRepository.find(query, {}, options)
    return requests
  }
}
