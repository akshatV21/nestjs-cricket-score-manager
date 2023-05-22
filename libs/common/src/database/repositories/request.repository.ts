import { Injectable } from '@nestjs/common'
import { AbstractRepository } from '../abstract.repository'
import { Request, RequestDocument, Team, TeamDocument } from '../models'
import { InjectConnection, InjectModel } from '@nestjs/mongoose'
import { Connection, Model } from 'mongoose'

@Injectable()
export class RequestRepository extends AbstractRepository<RequestDocument, Request> {
  constructor(
    @InjectModel(Request.name) RequestModel: Model<RequestDocument>,
    @InjectConnection() connection: Connection,
  ) {
    super(RequestModel, connection)
  }
}
