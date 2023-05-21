import { IsEmail, IsJWT, IsNotEmpty, IsString } from 'class-validator'
import { AuthorizeDto } from './authorize.dto'

export class UserRegisteredDto {
  @IsNotEmpty()
  @IsJWT()
  jwt: string

  @IsNotEmpty()
  @IsEmail()
  email: string

  @IsNotEmpty()
  @IsString()
  name: string
}
