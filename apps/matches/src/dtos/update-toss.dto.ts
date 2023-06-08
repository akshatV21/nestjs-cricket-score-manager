import { TOSS_VALUES, TOSS_WINNING_OPTIONS, TossValue, TossWinningOption } from '@lib/utils'
import { Type } from 'class-transformer'
import { IsEnum, IsMongoId, IsNotEmpty } from 'class-validator'
import { Types } from 'mongoose'

export class UpdateTossDto {
  @IsNotEmpty()
  @IsMongoId()
  @Type(() => Types.ObjectId)
  matchId: Types.ObjectId

  @IsNotEmpty()
  @IsMongoId()
  @Type(() => Types.ObjectId)
  wonBy: Types.ObjectId

  @IsNotEmpty()
  @IsEnum(TOSS_VALUES)
  called: TossValue

  @IsNotEmpty()
  @IsEnum(TOSS_VALUES)
  landed: TossValue

  @IsNotEmpty()
  @IsEnum(TOSS_WINNING_OPTIONS)
  elected: TossWinningOption
}
