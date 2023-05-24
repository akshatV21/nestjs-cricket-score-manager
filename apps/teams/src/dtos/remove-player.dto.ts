import { Type } from 'class-transformer'
import { IsMongoId, IsNotEmpty } from 'class-validator'
import { Types } from 'mongoose'

export class RemovePlayerDto {
  @IsNotEmpty()
  @IsMongoId()
  @Type(() => Types.ObjectId)
  playerId: Types.ObjectId
}
