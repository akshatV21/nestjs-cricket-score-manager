import { Type } from 'class-transformer'
import { IsMongoId, IsNotEmpty } from 'class-validator'
import { Types } from 'mongoose'

export class CreateChatDto {
  @IsNotEmpty()
  @IsMongoId()
  @Type(() => Types.ObjectId)
  teamToAdd: Types.ObjectId
}
