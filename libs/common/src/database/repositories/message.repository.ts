import { Injectable } from '@nestjs/common'
import { AbstractRepository } from '../abstract.repository'
import { Message, MessageDocument, Team, TeamDocument } from '../models'
import { InjectConnection, InjectModel } from '@nestjs/mongoose'
import { Connection, Model } from 'mongoose'

@Injectable()
export class MessageRepository extends AbstractRepository<MessageDocument, Message> {
  constructor(
    @InjectModel(Message.name) MessageModel: Model<MessageDocument>,
    @InjectConnection() connection: Connection,
  ) {
    super(MessageModel, connection)
  }
}
