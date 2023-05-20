import { USER_TYPE, UserType } from '@lib/utils'
import { Type } from 'class-transformer'
import { IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { Types } from 'mongoose'

export class RegisterUserDto {
  @IsNotEmpty()
  @IsString()
  firstName: string

  @IsNotEmpty()
  @IsString()
  lastName: string

  @IsNotEmpty()
  @IsString()
  email: string

  @IsNotEmpty()
  @IsString()
  password: string

  @IsNotEmpty()
  @IsEnum(USER_TYPE)
  type: UserType

  @IsOptional()
  @IsMongoId()
  @Type(() => Types.ObjectId)
  team?: Types.ObjectId
}
