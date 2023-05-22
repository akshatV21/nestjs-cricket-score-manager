import { REQUEST_STATUS, RequestStatus, RequestType } from '@lib/utils'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export type RequestDocument = Request & Document

@Schema({ timestamps: true })
export class Request {
  @Prop({ required: true, ref: 'Teams' })
  team: Types.ObjectId

  @Prop({ required: true, ref: 'User' })
  user: Types.ObjectId

  @Prop({ required: true, type: String })
  type: RequestType

  @Prop({ required: true })
  message: string

  @Prop({ default: REQUEST_STATUS.UNANSWERED, type: String })
  status?: RequestStatus

  @Prop({ default: null })
  response?: string
}

export const RequestSchema = SchemaFactory.createForClass(Request)
