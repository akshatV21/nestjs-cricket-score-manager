import { NewBallDto } from '@lib/utils'
import { Type } from 'class-transformer'
import { IsDefined, IsMongoId, IsNotEmpty, IsNotEmptyObject, ValidateNested } from 'class-validator'
import { Types } from 'mongoose'

export class NewBallPerformanceDto {
  @IsNotEmpty()
  @IsMongoId()
  @Type(() => Types.ObjectId)
  token: Types.ObjectId

  @IsDefined()
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => NewBallDto)
  body: NewBallDto
}
