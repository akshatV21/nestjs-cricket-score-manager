import { Format, MATCH_STATUS, MatchStatus } from '@lib/utils'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'
import { Squad } from './squad.schema'
import { Inning } from './innings.schema'
import { Result } from './result.schema'

export type MatchDocument = Match & Document

@Schema({ timestamps: true })
export class Match {
  @Prop({ required: true, ref: 'Team' })
  teams: Types.ObjectId[]

  @Prop({ ref: 'Team' })
  toss: Types.ObjectId

  @Prop({ default: MATCH_STATUS.REQUESTED, type: String })
  status: MatchStatus

  @Prop({ default: [] })
  squads: Squad[]

  @Prop({ required: true, type: String })
  format: Format

  @Prop({ required: true })
  time: Date

  @Prop({ required: true, ref: 'Team' })
  requestBy: Types.ObjectId

  @Prop({ default: {} })
  firstInnings: Inning

  @Prop({ default: {} })
  secondInnings: Inning

  @Prop({ default: {} })
  result: Result
}

export const MatchSchema = SchemaFactory.createForClass(Match)
