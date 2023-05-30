import { FORMATS, Format } from '@lib/utils'
import { Type } from 'class-transformer'
import { IsDateString, IsEnum, IsMongoId, IsNotEmpty } from 'class-validator'
import { Types } from 'mongoose'

export class CreateMatchDto {
  @IsNotEmpty()
  @IsMongoId()
  @Type(() => Types.ObjectId)
  toTeamId: Types.ObjectId

  @IsNotEmpty()
  @IsEnum(FORMATS)
  format: Format

  @IsNotEmpty()
  @IsDateString()
  @Type(() => Date)
  time: Date
}
