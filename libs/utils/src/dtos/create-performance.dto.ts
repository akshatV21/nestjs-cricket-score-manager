import { Transform, Type } from 'class-transformer'
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsDefined,
  IsJWT,
  IsMongoId,
  IsNotEmpty,
  IsNotEmptyObject,
  ValidateNested,
} from 'class-validator'
import { Types } from 'mongoose'

class MatchInfo {
  @IsNotEmpty()
  @IsMongoId()
  @Type(() => Types.ObjectId)
  matchId: Types.ObjectId

  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(22)
  @ArrayMaxSize(22)
  @IsMongoId({ each: true })
  @Transform(({ value }) => value.map((id: string) => new Types.ObjectId(id)))
  players: Types.ObjectId[]
}

export class CreatePerformanceDto {
  @IsNotEmpty()
  @IsJWT()
  token: string

  @IsDefined()
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => MatchInfo)
  body: MatchInfo
}
