import { ExecutionContext, createParamDecorator } from '@nestjs/common'

export const Match = createParamDecorator((input: any, ctx: ExecutionContext) => {
  return ctx.switchToHttp().getRequest().match
})
