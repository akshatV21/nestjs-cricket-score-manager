import { CHAT_TYPE, CONTEXT_TYPES, REQUEST_STATUS, REQUEST_TYPES, SERVICES, USER_TYPE } from '../constants'

type ObjectValuesUnion<T extends Record<string, string>> = T extends Record<string, infer U> ? U : never

export type UserType = ObjectValuesUnion<typeof USER_TYPE>

export type Service = ObjectValuesUnion<typeof SERVICES>

export type RequestContextType = ObjectValuesUnion<typeof CONTEXT_TYPES>

export type RequestType = ObjectValuesUnion<typeof REQUEST_TYPES>

export type RequestStatus = ObjectValuesUnion<typeof REQUEST_STATUS>

export type ChatType = ObjectValuesUnion<typeof CHAT_TYPE>
