import { CHAT_TYPE, ChatType, MESSAGE_TYPES, MessageType } from '@lib/utils'
import { Type } from 'class-transformer'
import { IsEnum, IsMongoId, IsNotEmpty, IsString, ValidateIf } from 'class-validator'
import { Types } from 'mongoose'

export class CreateMessageDto {
  @IsNotEmpty()
  @IsMongoId()
  @Type(() => Types.ObjectId)
  chat: Types.ObjectId

  @IsNotEmpty()
  @IsEnum(CHAT_TYPE)
  forChatType: ChatType

  @IsNotEmpty()
  @IsEnum(MESSAGE_TYPES)
  type: MessageType

  @ValidateIf((object: CreateMessageDto, value) => object.forChatType === 'between-team')
  @IsMongoId()
  @Type(() => Types.ObjectId)
  team?: Types.ObjectId

  @ValidateIf((object: CreateMessageDto, value) => object.forChatType === 'in-team')
  @IsMongoId()
  @Type(() => Types.ObjectId)
  user?: Types.ObjectId

  @ValidateIf((object: CreateMessageDto, value) => object.type === 'match-request')
  @IsString()
  link?: string
}
