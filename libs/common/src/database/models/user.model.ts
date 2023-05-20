import { UserType } from '@lib/utils'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { hashSync } from 'bcrypt'
import { Document, Types } from 'mongoose'

export type UserDocument = User & Document

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  firstName: string

  @Prop({ required: true })
  lastName: string

  @Prop({ required: true })
  email: string

  @Prop({ required: true })
  password: string

  @Prop({ required: true, type: String })
  type: UserType

  @Prop({ default: null, ref: 'Team' })
  team?: Types.ObjectId

  @Prop({ default: null, ref: 'Statistics' })
  statistics?: Types.ObjectId
}

const UserSchema = SchemaFactory.createForClass(User)

UserSchema.pre('save', function (next) {
  if (!this.isModified('password')) return next()
  this.password = hashSync(this.password, 4)
  return next()
})

export { UserSchema }
