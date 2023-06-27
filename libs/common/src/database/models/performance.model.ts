import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export type PerformanceDocument = Performance & Document

@Schema()
class BattingPerformace {
  @Prop({ default: 0 })
  runs?: number

  @Prop({ default: 0 })
  balls?: number

  @Prop({ default: 0 })
  strikeRate?: number

  @Prop({ default: 0 })
  fours?: number

  @Prop({ default: 0 })
  sixes?: number

  @Prop({ default: null })
  position?: number

  @Prop({ default: null })
  isNotOut?: boolean
}

@Schema()
class BowlingPerformace {
  @Prop({ default: 0 })
  overs?: number

  @Prop({ default: 0 })
  balls?: number

  @Prop({ default: 0 })
  runsConceded?: number

  @Prop({ default: 0 })
  wickets?: number

  @Prop({ default: 0 })
  economy?: number

  @Prop({ default: 0 })
  noballs?: number

  @Prop({ default: 0 })
  wides?: number
}

@Schema({ timestamps: true })
export class Performance {
  @Prop({ required: true, ref: 'User' })
  player: Types.ObjectId

  @Prop({ required: true, ref: 'Match' })
  match: Types.ObjectId

  @Prop({ default: { runs: 0, balls: 0, strikeRate: 0, fours: 0, sixes: 0 } })
  batting?: BattingPerformace

  @Prop({ default: { overs: 0, balls: 0, runsConceded: 0, wickets: 0, economy: 0, noballs: 0, wides: 0 } })
  bowling?: BowlingPerformace
}

export const PerformanceSchema = SchemaFactory.createForClass(Performance)
