import { Injectable } from '@nestjs/common'
import { AbstractRepository } from '../abstract.repository'
import { User, UserDocument } from '../models'
import { InjectConnection, InjectModel } from '@nestjs/mongoose'
import { Connection, Model } from 'mongoose'

@Injectable()
export class UserRepository extends AbstractRepository<UserDocument, User> {
  constructor(@InjectModel(User.name) UserModel: Model<UserDocument>, @InjectConnection() connection: Connection) {
    super(UserModel, connection)
  }
}
