import { IsEnum, IsJWT, IsNotEmpty, IsOptional } from 'class-validator'
import { RequestContextType, UserType } from '../types'
import { CONTEXT_TYPES, USER_TYPE } from '../constants'
import { UserDocument } from '@lib/common'

export class AuthorizeDto {
  @IsNotEmpty()
  @IsJWT()
  token: string

  @IsOptional()
  @IsEnum(USER_TYPE, { each: true })
  types: UserType[]

  @IsNotEmpty()
  @IsEnum(CONTEXT_TYPES)
  RequestContextType: RequestContextType

  user?: UserDocument
}
