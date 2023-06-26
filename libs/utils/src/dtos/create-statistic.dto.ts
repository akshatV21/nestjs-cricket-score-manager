import { Type } from 'class-transformer'
import { IsDefined, IsJWT, IsMongoId, IsNotEmpty, IsNotEmptyObject, ValidateNested } from 'class-validator'
import { Types } from 'mongoose'

class PlayerIdDto {
  @IsNotEmpty()
  @IsMongoId()
  @Type(() => Types.ObjectId)
  playerId: Types.ObjectId
}

export class CreateStatisticDto {
  @IsNotEmpty()
  @IsJWT()
  token: string

  @IsDefined()
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => PlayerIdDto)
  body: PlayerIdDto
}
