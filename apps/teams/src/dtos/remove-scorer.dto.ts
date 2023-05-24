import { Type } from 'class-transformer'
import { IsMongoId, IsNotEmpty } from 'class-validator'
import { Types } from 'mongoose'

export class RemoveScorerDto {
  @IsNotEmpty()
  @IsMongoId()
  @Type(() => Types.ObjectId)
  scorerId: Types.ObjectId
}
