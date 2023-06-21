import { NewBallDto } from '@lib/utils'
import { Type } from 'class-transformer'
import { IsDefined, IsMongoId, IsNotEmpty, IsNotEmptyObject, IsString, ValidateNested } from 'class-validator'

export class NewBallPerformanceDto {
  @IsNotEmpty()
  @IsString()
  token: string

  @IsDefined()
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => NewBallDto)
  body: NewBallDto
}
