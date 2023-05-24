import { IsNotEmpty, IsString } from 'class-validator'

export class UpdateNameDto {
  @IsNotEmpty()
  @IsString()
  name: string
}
