import { Socket } from 'socket.io'
import { RequestType, UserType } from '../types'
import { ChatDocument, MessageDocument, RequestDocument } from '@lib/common'
import { Types } from 'mongoose'

export interface AuthOptions {
  isLive?: boolean
  isOpen?: boolean
  types?: UserType[]
}

export interface AuthenticatedSocket extends Socket {
  entityId?: string
}

interface BaseDto {
  token: string
}

export interface RequestCreatedDto extends BaseDto {
  body: {
    userId: string | Types.ObjectId
    userEmail: string
    teamName: string
    requestId: string | Types.ObjectId
    requestType: RequestType
  }
}

export interface RequestAcceptedDto extends BaseDto {
  body: {
    managerId: string | Types.ObjectId
    userName: string
    teamName: string
    requestId: string | Types.ObjectId
    requestType: RequestType
  }
}

export interface RequestDeniedDto extends BaseDto {
  body: {
    managerId: string | Types.ObjectId
    userName: string
    teamName: string
    requestId: string | Types.ObjectId
    requestType: RequestType
  }
}

export interface TeamCreatedDto extends BaseDto {
  body: {
    teamId: string | Types.ObjectId
    managerId: string | Types.ObjectId
  }
}

export interface UserAddedToTeamDto extends BaseDto {
  body: {
    teamId: string | Types.ObjectId
    userId: string | Types.ObjectId
  }
}

export interface MessageCreatedDto {
  message: MessageDocument
  chat: ChatDocument
}
