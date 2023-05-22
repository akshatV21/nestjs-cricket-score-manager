import { REQUEST_TYPES, RequestType } from '@lib/utils'
import { Type } from 'class-transformer'
import { IsEnum, IsMongoId, IsNotEmpty, IsString } from 'class-validator'
import { Types } from 'mongoose'

export class CreateRequestDto {
  @IsNotEmpty()
  @IsMongoId()
  @Type(() => Types.ObjectId)
  user: Types.ObjectId

  @IsNotEmpty()
  @IsString()
  message: string

  @IsNotEmpty()
  @IsEnum(REQUEST_TYPES)
  type: RequestType
}
