import { Format, MATCH_STATUS, MatchStatus } from '@lib/utils'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export type MatchDocument = Match & Document

@Schema({ timestamps: true })
export class Match {
  @Prop({ required: true, ref: 'Team' })
  teams: Types.ObjectId[]

  @Prop({ default: MATCH_STATUS.REQUESTED, type: String })
  status: MatchStatus

  @Prop({ required: true, type: String })
  format: Format

  @Prop({ required: true })
  time: Date

  @Prop({ required: true, ref: 'Team' })
  requestBy: Types.ObjectId

  @Prop({ default: {} })
  firstInnings: {}

  @Prop({ default: {} })
  secondInnings: {}

  @Prop({ default: {} })
  result: {}
}

export const MatchSchema = SchemaFactory.createForClass(Match)
