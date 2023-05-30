import { ForbiddenException, Injectable } from '@nestjs/common'
import { CreateChatDto } from './dtos/create-chat.dto'
import { ChatDocument, ChatRepository, TeamRepository, UserDocument, UserRepository } from '@lib/common'
import { ProjectionType, QueryOptions, Types } from 'mongoose'
import { CHATS_PAGENATION_LIMIT, EVENTS, TeamCreatedDto, UserAddedToTeamDto } from '@lib/utils'
import { EventEmitter2 } from '@nestjs/event-emitter'

@Injectable()
export class ChatsService {
  constructor(
    private readonly ChatRepository: ChatRepository,
    private readonly TeamRepository: TeamRepository,
    private readonly UserRepository: UserRepository,
    private eventEmitter: EventEmitter2,
  ) {}

  async createBetweenTeamChat({ teamToAdd }: CreateChatDto, user: UserDocument, token: string) {
    const teams = [user.team, teamToAdd]

    const chatObjectId = new Types.ObjectId()
    const session = await this.ChatRepository.startTransaction()

    try {
      const createChatPromise = this.ChatRepository.create({ type: 'between-team', teams }, chatObjectId)
      const updateTeamOnePromise = this.TeamRepository.update(user.team, { $push: { chats: chatObjectId } })
      const updateTeamTwoPromise = this.TeamRepository.update(teamToAdd, { $push: { chats: chatObjectId } })

      const [chat] = await Promise.all([createChatPromise, updateTeamOnePromise, updateTeamTwoPromise])
      await session.commitTransaction()

      return chat
    } catch (error) {
      await session.abortTransaction()
      throw error
    }
  }

  async createInTeamChat({ body }: TeamCreatedDto) {
    const teamObjectId = new Types.ObjectId(body.teamId)
    const managerObjectId = new Types.ObjectId(body.managerId)

    const chatObjectId = new Types.ObjectId()
    const session = await this.ChatRepository.startTransaction()

    try {
      const createChatPromise = this.ChatRepository.create(
        { type: 'in-team', team: teamObjectId, members: [managerObjectId] },
        chatObjectId,
      )
      const updateTeamPromise = this.TeamRepository.update(teamObjectId, { $push: { chats: chatObjectId } })
      const updateUserPromise = this.UserRepository.update(managerObjectId, { $set: { chat: chatObjectId } })

      const [chat] = await Promise.all([createChatPromise, updateTeamPromise, updateUserPromise])
      await session.commitTransaction()

      return chat
    } catch (error) {
      await session.abortTransaction()
      throw error
    }
  }

  async addUserToTeam({ body }: UserAddedToTeamDto) {
    const teamObjectId = new Types.ObjectId(body.teamId)
    const userObjectId = new Types.ObjectId(body.userId)

    const session = await this.ChatRepository.startTransaction()

    try {
      const chat = await this.ChatRepository.updateByQuery({ team: teamObjectId }, { $push: { members: userObjectId } })
      await this.UserRepository.update(userObjectId, { $set: { chat: chat._id } })

      this.eventEmitter.emit(EVENTS.USER_ADDED_TO_TEAM, { chatId: chat._id.toString(), userId: body.userId })
      await session.commitTransaction()
    } catch (error) {
      await session.abortTransaction()
      throw error
    }
  }

  async get(chatId: Types.ObjectId, user: UserDocument) {
    const options: QueryOptions<ChatDocument> = { populate: { path: 'teams', select: 'name' } }
    const chat = await this.ChatRepository.findById(chatId, {}, options)
    if (!chat.teams.includes(user.team)) throw new ForbiddenException('You cannot make this request.')

    return chat
  }

  async list(page: number, user: UserDocument) {
    const skipCount = (page - 1) * CHATS_PAGENATION_LIMIT
    const options: QueryOptions<ChatDocument> = {
      populate: { path: 'teams', select: 'name' },
      skipCount,
      limit: CHATS_PAGENATION_LIMIT,
    }

    const chats = await this.ChatRepository.find(
      { teams: { $elemMatch: { $in: [new Types.ObjectId(user.team)] } } },
      {},
      options,
    )

    return chats
  }
}
