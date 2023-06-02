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
  toss?: Types.ObjectId

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
