import { Prop, Schema } from '@nestjs/mongoose'
import { Types } from 'mongoose'

@Schema()
export class RequestSchema {
  @Prop({ default: [], ref: 'Request' })
  sent: Types.ObjectId[]

  @Prop({ default: [], ref: 'Request' })
  recieved: Types.ObjectId[]
}
