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
  MATCH_SERVICE: 'MATCH',
  STATISTICS_SERVICE: 'STATISTICS',
} as const

export const EVENTS = {
  USER_REGISTERED: 'user-registered',
  USER_EMAIL_VALIDATED: 'user-email-validated',
  AUTHORIZE: 'authorize',
  REQUEST_CREATED: 'request-created',
  REQUEST_ACCEPTED: 'request-accepted',
  REQUEST_DENIED: 'request-denied',
  TEAM_CREATED: 'team-created',
  USER_ADDED_TO_TEAM: 'user-added-to-team',
  MSG_CREATED: 'message-created',
  JOIN_USER_CHAT_ROOMS: 'join-user-chat-room',
  STARTED_TYPING: 'started-typing',
  ENDED_TYPING: 'ended-typing',
  MSG_RECIEVED: 'message-recieved',
  MSG_SEEN: 'message-seen',
  MATCH_REQUESTED: 'match-requested',
  MATCH_SCHEDULED: 'match-scheduled',
  MATCH_REQUEST_DENIED: 'match-request-denied',
  MATCH_SQUAD_UPDATED: 'match-squad-updated',
  MATCH_STATUS_UPDATED: 'match-status-updated',
  JOIN_LIVE_MATCHES: 'join-live-matches',
  NEW_LIVE_MATCH: 'new-live-match',
  TOSS_UPDATED: 'toss-updated',
  NEW_BALL_BOWLED: 'new-ball-bowled',
  MATCH_ENDED: 'match-ended',
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
export const UPCOMING_MATCHES_LIMIT = 10
export const MATCH_SQUAD_LIMIT = 11
export const PLAYER_PERF_LIMIT = 10
export const PLAYER_STATS_LIMIT = 10

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

export const MATCH_STATUS = {
  REQUESTED: 'requested',
  DENIED: 'denied',
  UPCOMING: 'upcoming',
  TOSS: 'toss',
  FIRST_INNINGS: 'first-innings',
  SECOND_INNINGS: 'second-innings',
  INNINGS_BREAK: 'innings-break',
  FINISHED: 'finished',
  ABANDONED: 'abandoned',
  RESCHEDULED: 'rescheduled',
} as const

export const FORMATS = {
  ODI: 'odi',
  TEST: 'test',
  T20I: 't20i',
} as const

export const WON_BY_VALUES = {
  DEFENDING: 'defending',
  CHASING: 'chasing',
} as const

export const TOSS_VALUES = {
  HEADS: 'heads',
  TAILS: 'tails',
} as const

export const TOSS_WINNING_OPTIONS = {
  BATTING: 'battling',
  BOWLING: 'bowling',
} as const

export const BATTER_STATS = {
  MOST_RUNS: 'runs',
  MOST_BALLS: 'balls',
  MOST_FOURS: 'fours',
  MOST_SIXES: 'sixes',
  MOST_HALF_CENTURIES: 'half-centuries',
  MOST_CENTURIES: 'centuries',
  BEST_AVERAGE: 'average',
  BEST_STRIKE_RATE: 'strike-rate',
} as const

export const BOWLER_STATS = {
  MOST_WICKETS: 'wickets',
  BEST_AVERAGE: 'average',
  BEST_ECONOMY: 'economy',
  MOST_RUNS_CONCEDED: 'runsConceded',
  MOST_NOBALLS: 'noballs',
  MOST_WIDES: 'wides',
  MOST_BALLS: 'balls',
} as const
