import { Prop, Schema } from '@nestjs/mongoose'
import { Types } from 'mongoose'

@Schema()
export class Squad {
  @Prop({ ref: 'Team' })
  team: Types.ObjectId

  @Prop({ ref: 'User' })
  players: Types.ObjectId[]
}
