import { Type } from 'class-transformer'
import { IsBoolean, IsMongoId, IsNotEmpty, IsNumber, IsOptional, Max, Min, ValidateIf } from 'class-validator'
import { Types } from 'mongoose'

export class NewBallDto {
  @IsNotEmpty()
  @IsMongoId()
  @Type(() => Types.ObjectId)
  matchId: Types.ObjectId

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  over: number

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(6)
  ball: number

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(6)
  runs: number

  @ValidateIf(object => (object.runs === 4 ? true : object.runs === 6 ? true : false))
  @IsBoolean()
  isBoundary: boolean

  @IsOptional()
  @IsBoolean()
  isByes: boolean

  @IsOptional()
  @IsBoolean()
  isNoBall: boolean

  @IsOptional()
  @IsBoolean()
  isWide: boolean

  @IsOptional()
  @IsBoolean()
  isWicket: boolean

  @IsNotEmpty()
  @IsMongoId()
  @Type(() => Types.ObjectId)
  batter: Types.ObjectId

  @IsNotEmpty()
  @IsMongoId()
  @Type(() => Types.ObjectId)
  bowler: Types.ObjectId
}
