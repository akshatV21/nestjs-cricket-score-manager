export const USER_TYPE = {
  PLAYER: 'player',
  SCORER: 'scorer',
  MANAGER: 'manager',
} as const

export const SERVICES = {
  AUTH_SERVICE: 'AUTH',
  NOTIFICATIONS_SERVICE: 'NOTIFICATIONS',
  TEAMS_SERVICE: 'TEAMS',
  CHATS_SERVICE: 'CHATS',
} as const

export const EVENTS = {
  USER_REGISTERED: 'user-registered',
  AUTHORIZE: 'authorize',
  REQUEST_CREATED: 'request-created',
  REQUEST_ACCEPTED: 'request-accepted',
  REQUEST_DENIED: 'request-denied',
  TEAM_CREATED: 'team-created',
  USER_ADDED_TO_TEAM: 'user-added-to-team',
  MSG_CREATED: 'message-created',
} as const

export const CONTEXT_TYPES = {
  HTTP: 'http',
  RPC: 'rpc',
  WS: 'ws',
} as const

export const EXCEPTION_MSGS = {
  NULL_TOKEN: 'TokenNotProvided',
  UNAUTHORIZED: 'UnauthorizedAccess',
  JWT_EXPIRED: 'JwtExpired',
  INVALID_JWT: 'InvalidJwt',
  UNVERIFIED_EMAIL: 'EmailNotVerified',
} as const

export const REQUEST_TYPES = {
  PLAYER: 'player-join-request',
  SCORER: 'scorer-join-request',
} as const

export const SQUAD_LIMIT = 18

export const REQUEST_STATUS = {
  ACCEPTED: 'accepted',
  DENIED: 'denied',
  UNANSWERED: 'answered',
} as const

export const TEAMS_PAGINATION_LIMIT = 5
export const REQUESTS_PAGINATION_LIMIT = 5
export const CHATS_PAGENATION_LIMIT = 4

export const CHAT_TYPE = {
  IN_TEAM: 'in-team',
  BETWEEN_TEAM: 'between-team',
} as const

export const MESSAGE_TYPES = {
  TEXT: 'text',
  ACCOUNCEMENT: 'annoucement',
  MATCH_REQUEST: 'match-request',
} as const

export const MESSAGE_STATUS = {
  SENT: 'sent',
  RECIEVED: 'recieved',
  SEEN: 'seen',
} as const
