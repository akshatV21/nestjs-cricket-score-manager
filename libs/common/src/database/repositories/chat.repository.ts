import { Injectable } from '@nestjs/common'
import { AbstractRepository } from '../abstract.repository'
import { Chat, ChatDocument, Team, TeamDocument } from '../models'
import { InjectConnection, InjectModel } from '@nestjs/mongoose'
import { Connection, Model } from 'mongoose'

@Injectable()
export class ChatRepository extends AbstractRepository<ChatDocument, Chat> {
  constructor(@InjectModel(Chat.name) ChatModel: Model<ChatDocument>, @InjectConnection() connection: Connection) {
    super(ChatModel, connection)
  }
}
