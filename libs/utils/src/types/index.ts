import {
  BATTER_STATS,
  BOWLER_STATS,
  CHAT_TYPE,
  CONTEXT_TYPES,
  FORMATS,
  MATCH_STATUS,
  MESSAGE_STATUS,
  MESSAGE_TYPES,
  REQUEST_STATUS,
  REQUEST_TYPES,
  SERVICES,
  TOSS_VALUES,
  TOSS_WINNING_OPTIONS,
  USER_TYPE,
  WON_BY_VALUES,
} from '../constants'

type ObjectValuesUnion<T extends Record<string, string>> = T extends Record<string, infer U> ? U : never

export type UserType = ObjectValuesUnion<typeof USER_TYPE>

export type Service = ObjectValuesUnion<typeof SERVICES>

export type RequestContextType = ObjectValuesUnion<typeof CONTEXT_TYPES>

export type RequestType = ObjectValuesUnion<typeof REQUEST_TYPES>

export type RequestStatus = ObjectValuesUnion<typeof REQUEST_STATUS>

export type ChatType = ObjectValuesUnion<typeof CHAT_TYPE>

export type MessageType = ObjectValuesUnion<typeof MESSAGE_TYPES>

export type MessageStatus = ObjectValuesUnion<typeof MESSAGE_STATUS>

export type MatchStatus = ObjectValuesUnion<typeof MATCH_STATUS>

export type Format = ObjectValuesUnion<typeof FORMATS>

export type WonBy = ObjectValuesUnion<typeof WON_BY_VALUES>

export type TossValue = ObjectValuesUnion<typeof TOSS_VALUES>

export type TossWinningOption = ObjectValuesUnion<typeof TOSS_WINNING_OPTIONS>

export type BatterStats = ObjectValuesUnion<typeof BATTER_STATS>

export type BowlerStats = ObjectValuesUnion<typeof BOWLER_STATS>

export type StatType = 'batting' | 'bowling'
