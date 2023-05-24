import { ChatType } from '@lib/utils'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export type ChatDocument = Chat & Document

@Schema({ timestamps: true })
export class Chat {
  @Prop({ required: true, type: String })
  type: ChatType

  @Prop({ ref: 'Team' })
  team?: Types.ObjectId

  @Prop({ ref: 'Team' })
  teams?: Types.ObjectId[]

  @Prop({ required: true, ref: 'User' })
  members?: Types.ObjectId[]

  @Prop({ default: [], ref: 'Message' })
  messages?: Types.ObjectId[]
}

export const ChatSchema = SchemaFactory.createForClass(Chat)
