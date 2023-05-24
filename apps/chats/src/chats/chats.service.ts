import { Injectable } from '@nestjs/common'
import { CreateChatDto } from './dtos/create-chat.dto'
import { ChatRepository, TeamRepository, UserDocument } from '@lib/common'
import { Types } from 'mongoose'

@Injectable()
export class ChatsService {
  constructor(private readonly ChatRepository: ChatRepository, private readonly TeamRepository: TeamRepository) {}

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
}
