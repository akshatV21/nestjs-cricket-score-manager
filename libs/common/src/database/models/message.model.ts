import { MESSAGE_STATUS, MessageStatus, MessageType } from '@lib/utils'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export type MessageDocument = Message & Document

@Schema({ timestamps: true })
export class Message {
  @Prop({ required: true, ref: 'Chat' })
  chat: Types.ObjectId

  @Prop({ ref: 'Team' })
  team?: Types.ObjectId

  @Prop({ ref: 'User' })
  user?: Types.ObjectId

  @Prop({ required: true, type: String })
  type: MessageType

  @Prop({ default: MESSAGE_STATUS.SENT, type: String })
  status?: MessageStatus

  @Prop({ default: [], ref: 'User' })
  likes?: Types.ObjectId[]
}

export const MessageSchema = SchemaFactory.createForClass(Message)
