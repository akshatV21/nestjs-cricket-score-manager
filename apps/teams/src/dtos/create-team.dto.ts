import { Type } from 'class-transformer'
import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { Types } from 'mongoose'

export class CreateTeamDto {
  @IsNotEmpty()
  @IsString()
  name: string

  @IsOptional()
  @IsMongoId()
  @Type(() => Types.ObjectId)
  scorer: Types.ObjectId
}
