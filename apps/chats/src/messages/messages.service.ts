import { ChatRepository, MessageRepository, UserDocument } from '@lib/common'
import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common'
import { CreateMessageDto } from './dtos/create-message.dto'
import { Types } from 'mongoose'
import { EVENTS, MessageCreatedDto } from '@lib/utils'
import { EventEmitter2 } from '@nestjs/event-emitter'

@Injectable()
export class MessagesService {
  constructor(
    private readonly ChatRepository: ChatRepository,
    private readonly MessageRepository: MessageRepository,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(createMessageDto: CreateMessageDto, user: UserDocument) {
    const chat = await this.ChatRepository.findById(createMessageDto.chat)
    const chatType = createMessageDto.forChatType

    if (chatType !== chat.type) throw new BadRequestException('Invalid chat tyeo for provided chat id.')

    if (chatType === 'in-team' && !user._id.equals(createMessageDto.user))
      throw new BadRequestException('Provided user does not match with Authorized user.')

    if (chatType === 'between-team' && !createMessageDto.team.equals(user.team))
      throw new BadRequestException("Provided team does not match with Authorized user's team.")

    if (chatType === 'in-team' && !chat.members.includes(user._id))
      throw new ForbiddenException('You are forbidden to make this request.')

    if (chatType === 'between-team' && !chat.team.equals(user.team))
      throw new ForbiddenException('You are forbidden to make this request.')

    const msgObjectId = new Types.ObjectId()
    const session = await this.MessageRepository.startTransaction()

    try {
      const createMessagePromise = this.MessageRepository.create(createMessageDto, msgObjectId)
      const updateChatPromise = this.ChatRepository.update(chat._id, { $push: { messages: msgObjectId } })

      const [message] = await Promise.all([createMessagePromise, updateChatPromise])

      this.eventEmitter.emit(EVENTS.MSG_CREATED, { message, chat })
      await session.commitTransaction()
    } catch (error) {
      await session.abortTransaction()
      throw error
    }
  }
}
