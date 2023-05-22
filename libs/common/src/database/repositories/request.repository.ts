import { Injectable } from '@nestjs/common'
import { AbstractRepository } from '../abstract.repository'
import { Request, RequestDocument, Team, TeamDocument } from '../models'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

@Injectable()
export class RequestRepository extends AbstractRepository<RequestDocument, Request> {
  constructor(@InjectModel(Request.name) RequestModel: Model<RequestDocument>) {
    super(RequestModel)
  }
}
