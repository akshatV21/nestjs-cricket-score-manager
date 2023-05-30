import { WonBy } from '@lib/utils'
import { Prop, Schema } from '@nestjs/mongoose'
import { Types } from 'mongoose'

@Schema()
export class Result {
  @Prop({ ref: 'Team' })
  winningTeam: Types.ObjectId

  @Prop({ type: String })
  wonBy: WonBy

  @Prop()
  runs: number

  @Prop()
  wickets: number
}
