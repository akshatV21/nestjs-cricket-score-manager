import { MATCH_STATUS, MatchStatus } from '@lib/utils'
import { Type } from 'class-transformer'
import { IsEnum, IsMongoId, IsNotEmpty } from 'class-validator'
import { Types } from 'mongoose'

export class UpdateMatchStatusDto {
  @IsNotEmpty()
  @IsMongoId()
  @Type(() => Types.ObjectId)
  matchId: Types.ObjectId

  @IsNotEmpty()
  @IsEnum(MATCH_STATUS)
  status: MatchStatus
}
