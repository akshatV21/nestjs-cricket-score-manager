import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export type TeamDocument = Team & Document

@Schema({ timestamps: true })
export class Team {
  @Prop({ required: true })
  name: string

  @Prop({ required: true, ref: 'User' })
  manager: Types.ObjectId

  @Prop({ default: null, ref: 'User' })
  scorer?: Types.ObjectId

  @Prop({ default: [], ref: 'User' })
  squad?: Types.ObjectId[]

  @Prop({ default: null, ref: 'Match' })
  nextMatch?: Types.ObjectId

  @Prop({ default: [], ref: 'Match' })
  matchesPlayed?: Types.ObjectId[]

  @Prop({ default: [], ref: 'Match' })
  upcomingMatches?: Types.ObjectId[]

  @Prop({ default: [], ref: 'Request' })
  requests?: Types.ObjectId[]

  @Prop({ default: [], ref: 'Statistic' })
  statistics?: Types.ObjectId
}

export const TeamSchema = SchemaFactory.createForClass(Team)
