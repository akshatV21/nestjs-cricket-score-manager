export const USER_TYPE = {
  PLAYER: 'player',
  SCORER: 'scorer',
  MANAGER: 'manager',
} as const

export const SERVICES = {
  AUTH_SERVICE: 'AUTH',
  NOTIFICATIONS_SERVICE: 'NOTIFICATIONS',
  TEAMS_SERVICE: 'TEAMS',
} as const

export const EVENTS = {
  USER_REGISTERED: 'user-registered',
  AUTHORIZE: 'authorize',
  REQUEST_CREATED: 'request-created',
  REQUEST_ACCEPTED: 'request-accepted',
  REQUEST_DENIED: 'request-denied',
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
