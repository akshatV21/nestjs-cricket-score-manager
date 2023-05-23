import { Socket } from 'socket.io'
import { UserType } from '../types'
import { RequestDocument } from '@lib/common'

export interface AuthOptions {
  isLive?: boolean
  isOpen?: boolean
  types?: UserType[]
}

export interface AuthenticatedSocket extends Socket {
  entityId?: string
}

export interface RequestCreatedDto {
  request: RequestDocument
  token: string
}

export interface RequestAcceptedDto extends RequestCreatedDto {}

export interface RequestDeniedDto extends RequestCreatedDto {}
