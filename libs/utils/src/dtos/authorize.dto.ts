import { IsEnum, IsJWT, IsNotEmpty, IsOptional } from 'class-validator'
import { RequestType, UserType } from '../types'
import { REQUEST_TYPEs, USER_TYPE } from '../constants'
import { UserDocument } from '@lib/common'

export class AuthorizeDto {
  @IsNotEmpty()
  @IsJWT()
  token: string

  @IsOptional()
  @IsEnum(USER_TYPE, { each: true })
  types: UserType[]

  @IsNotEmpty()
  @IsEnum(REQUEST_TYPEs)
  requestType: RequestType

  user?: UserDocument
}
