import { Type } from 'class-transformer'
import { IsDateString, IsMongoId, IsNotEmpty } from 'class-validator'
import { Types } from 'mongoose'

export class RescheduleMatchDto {
  @IsNotEmpty()
  @IsMongoId()
  @Type(() => Types.ObjectId)
  matchId: Types.ObjectId

  @IsNotEmpty()
  @IsDateString()
  @Type(() => Date)
  time: Date
}
