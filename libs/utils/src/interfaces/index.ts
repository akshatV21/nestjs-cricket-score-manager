import { UserType } from '../types'

export interface AuthOptions {
  isLive?: boolean
  isOpen?: boolean
  types?: UserType[]
}
