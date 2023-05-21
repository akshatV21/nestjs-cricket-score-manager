import { IsEnum, IsJWT, IsNotEmpty } from 'class-validator'
import { UserType } from '../types'
import { USER_TYPE } from '../constants'

export class AuthorizeDto {
  @IsNotEmpty()
  @IsJWT()
  token: string

  @IsNotEmpty()
  @IsEnum(USER_TYPE, { each: true })
  types: UserType[]
}
