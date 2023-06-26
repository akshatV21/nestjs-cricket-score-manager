import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export type StatisticDocument = Statistic & Document

@Schema()
export class BattingSchema {
  @Prop()
  innings?: number

  @Prop()
  runs?: number

  @Prop()
  balls?: number

  @Prop()
  average?: number

  @Prop()
  strikeRate?: number

  @Prop()
  fours?: number

  @Prop()
  sixes?: number
}

@Schema()
export class BowlingSchema {
  @Prop()
  balls?: number

  @Prop()
  runsConceded?: number

  @Prop()
  wickets?: number

  @Prop()
  average?: number

  @Prop()
  economy?: number

  @Prop()
  noballs?: number

  @Prop()
  wides?: number
}

@Schema({ timestamps: true })
export class Statistic {
  @Prop({ required: true, ref: 'User' })
  player: Types.ObjectId

  @Prop({ default: { innings: 0, runs: 0, balls: 0, average: 0, strikeRate: 0, fours: 0, sixes: 0 } })
  batting?: BattingSchema

  @Prop({ default: { balls: 0, runsConceded: 0, wickets: 0, average: 0, economy: 0, noballs: 0, wides: 0 } })
  bowling?: BowlingSchema
}

export const StatisticSchema = SchemaFactory.createForClass(Statistic)
