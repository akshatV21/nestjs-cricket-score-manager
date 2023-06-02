import { Type, Transform, TransformFnParams } from 'class-transformer'
import { ArrayMaxSize, IsMongoId, IsNotEmpty } from 'class-validator'
import { Types } from 'mongoose'

export class UpdateSquadDto {
  @IsNotEmpty()
  @IsMongoId({ each: true })
  @ArrayMaxSize(11)
  @Transform(({ value }) => value.map((id: string) => new Types.ObjectId(id)))
  players: Types.ObjectId[]

  @IsNotEmpty()
  @IsMongoId()
  @Type(() => Types.ObjectId)
  matchId: Types.ObjectId
}
