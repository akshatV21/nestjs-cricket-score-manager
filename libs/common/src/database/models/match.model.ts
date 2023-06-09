import { Format, MATCH_STATUS, MatchStatus, TossValue, TossWinningOption } from '@lib/utils'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'
import { Squad } from './squad.schema'
import { Inning } from './innings.schema'
import { Result } from './result.schema'

export type MatchDocument = Match & Document

@Schema()
class TossSchema {
  @Prop({ default: null, ref: 'Team' })
  wonBy: Types.ObjectId

  @Prop({ default: null, type: String })
  called: TossValue

  @Prop({ default: null, type: String })
  landed: TossValue

  @Prop({ default: null, type: String })
  elected: TossWinningOption
}

@Schema()
export class LiveBattersSchema {
  @Prop({ default: null, ref: 'Performance' })
  performance: Types.ObjectId

  @Prop({ default: null })
  isOnStrike: boolean
}

@Schema()
class LiveStats {
  @Prop({ default: [] })
  batters: LiveBattersSchema[]

  @Prop({ default: [] })
  bowler: Types.ObjectId
}

@Schema({ timestamps: true })
export class Match {
  @Prop({ required: true, ref: 'Team' })
  teams: Types.ObjectId[]

  @Prop({ default: { wonBy: null, landed: null, elected: null }, ref: 'Team' })
  toss?: TossSchema

  @Prop({ default: MATCH_STATUS.REQUESTED, type: String })
  status?: MatchStatus

  @Prop({ default: [] })
  squads?: Squad[]

  @Prop({ required: true, type: String })
  format: Format

  @Prop({ required: true })
  time: Date

  @Prop({ required: true, ref: 'Team' })
  requestBy: Types.ObjectId

  @Prop({ default: {} })
  firstInnings?: Inning

  @Prop({ default: {} })
  secondInnings?: Inning

  @Prop({ default: {} })
  live?: LiveStats

  @Prop({ default: {} })
  result?: Result
}

const MatchSchema = SchemaFactory.createForClass(Match)

MatchSchema.pre('save', function (next) {
  if (!this.isModified('teams')) return next()

  const squads: Squad[] = [
    {
      team: this.teams[0],
      players: [],
    },
    {
      team: this.teams[1],
      players: [],
    },
  ]
  this.squads = squads

  return next()
})

export { MatchSchema }
