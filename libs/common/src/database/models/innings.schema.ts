import { Prop, Schema } from '@nestjs/mongoose'
import { Types } from 'mongoose'

@Schema()
export class Inning {
  @Prop({ default: null, ref: 'Team' })
  team: Types.ObjectId

  @Prop({ default: 0 })
  runs: number

  @Prop({ default: 0, max: 10 })
  wickets: number

  @Prop({ default: 0 })
  overs: number

  @Prop({ default: 0 })
  balls: number

  @Prop({ default: [], ref: 'Performance' })
  batting: Types.ObjectId[]

  @Prop({ default: [], ref: 'Performance' })
  bowling: Types.ObjectId[]

  @Prop({ default: 0 })
  noballs: number

  @Prop({ default: 0 })
  wides: number

  @Prop({ default: 0 })
  byes: number

  @Prop({ default: 0 })
  fours: number

  @Prop({ default: 0 })
  sixes: number
}
