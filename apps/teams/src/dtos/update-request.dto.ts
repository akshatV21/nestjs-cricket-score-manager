import { Type } from 'class-transformer'
import { IsMongoId, IsNotEmpty, IsString } from 'class-validator'
import { Types } from 'mongoose'

export class UpdateRequestDto {
  @IsNotEmpty()
  @IsMongoId()
  @Type(() => Types.ObjectId)
  request: Types.ObjectId

  @IsNotEmpty()
  @IsMongoId()
  @Type(() => Types.ObjectId)
  team: Types.ObjectId

  @IsNotEmpty()
  @IsString()
  response: string
}
