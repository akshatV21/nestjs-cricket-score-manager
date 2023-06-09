import { Socket } from 'socket.io'
import { MatchStatus, RequestType, TossValue, TossWinningOption, UserType, WonBy } from '../types'
import { ChatDocument, LiveBattersSchema, MessageDocument, RequestDocument } from '@lib/common'
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

export interface JoinUserChatsDto {
  userId: string
  userType: UserType
  teamChat: string
  teamId: string
}

export interface StartedTypeingDto {
  chatId: string
  userId: string
}

export interface EndedTypeingDto {
  chatId: string
  userId: string
}

export interface MsgRecievedDto {
  chatId: string
  userId: string
  messageId: string
}

export interface MsgSeenDto {
  chatId: string
  userId: string
  messageId: string
}

export interface UserAddedToTeamMsgDto {
  chatId: string
  userId: string
}

export interface MatchRequestedDto extends BaseDto {
  body: {
    fromTeamName: string
    fromManagerId: string | Types.ObjectId
    fromTeamId: string | Types.ObjectId
    opponentManagerId: string | Types.ObjectId
    opponentTeamId: string | Types.ObjectId
    matchId: string | Types.ObjectId
  }
}

export interface MatchScheduledDto extends MatchRequestedDto {}

export interface MatchRequestDeniedDto extends MatchRequestedDto {}

export interface MatchSquadUpdatedDto extends BaseDto {
  body: {
    userTeam: string | Types.ObjectId
    opponentTeam: string | Types.ObjectId
  }
}

export class MatchStatusUpdatedDto {
  matchId: string | Types.ObjectId
  status: MatchStatus
}

export class TossUpdatedDto {
  matchId: string | Types.ObjectId
  wonBy: string | Types.ObjectId
  called: TossValue
  landed: TossValue
  elected: TossWinningOption
}

export class NewBallBowledDto {
  matchId: Types.ObjectId | string
  over: number
  ball: number
  runs: number
  isBoundary: boolean
  isByes: boolean
  isNoBall: boolean
  isWide: boolean
  isWicket: boolean
  batter: Types.ObjectId | string
  bowler: Types.ObjectId | string
  batters: LiveBattersSchema[]
}

export class MatchEndedDto {
  matchId: Types.ObjectId | string
  wonBy: WonBy
  winningTeam: Types.ObjectId | string
  runs: number | null
  wickets: number | null
}
