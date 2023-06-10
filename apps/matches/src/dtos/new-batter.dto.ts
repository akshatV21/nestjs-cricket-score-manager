import { Type } from 'class-transformer'
import { IsMongoId, IsNotEmpty } from 'class-validator'
import { Types } from 'mongoose'

export class NewBatterDto {
  @IsNotEmpty()
  @IsMongoId()
  @Type(() => Types.ObjectId)
  matchId: Types.ObjectId

  @IsNotEmpty()
  @IsMongoId()
  @Type(() => Types.ObjectId)
  playerId: Types.ObjectId
}
