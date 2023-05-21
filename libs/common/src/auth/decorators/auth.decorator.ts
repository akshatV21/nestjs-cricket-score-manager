import { AuthOptions } from '@lib/utils'
import { SetMetadata } from '@nestjs/common'

export const Auth = (options?: AuthOptions) => {
  const metadata: AuthOptions = {
    isLive: options?.isLive ?? true,
    isOpen: options?.isOpen ?? false,
    types: options?.types ?? ['player'],
  }

  return SetMetadata('authOptions', metadata)
}
