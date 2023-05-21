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
} as const

export const REQUEST_TYPEs = {
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
