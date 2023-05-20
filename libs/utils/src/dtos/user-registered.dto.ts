import { IsEmail, IsJWT, IsNotEmpty, IsString } from 'class-validator'

export class UserRegisteredDto {
  @IsNotEmpty()
  @IsJWT()
  token: string

  @IsNotEmpty()
  @IsEmail()
  email: string

  @IsNotEmpty()
  @IsString()
  name: string
}
