import { Transform, Type } from 'class-transformer'
import {
  ArrayMaxSize,
  ArrayMinSize,
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
  @IsMongoId({ each: true })
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @Transform(({ value }) => value.map((id: string) => new Types.ObjectId(id)))
  teams: Types.ObjectId[]
}

export class MatchEndedServiceDto {
  @IsNotEmpty()
  @IsJWT()
  token: string

  @IsDefined()
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => MatchInfo)
  body: MatchInfo
}
