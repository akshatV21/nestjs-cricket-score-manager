import { SERVICES, USER_TYPE } from '../constants'

type ObjectValuesUnion<T extends Record<string, string>> = T extends Record<string, infer U> ? U : never

export type UserType = ObjectValuesUnion<typeof USER_TYPE>

export type Service = ObjectValuesUnion<typeof SERVICES>
