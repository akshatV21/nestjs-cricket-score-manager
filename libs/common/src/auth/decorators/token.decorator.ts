import { ExecutionContext, createParamDecorator } from '@nestjs/common'

export const Token = createParamDecorator((input: any, ctx: ExecutionContext) => {
  return ctx.switchToHttp().getRequest().token
})
