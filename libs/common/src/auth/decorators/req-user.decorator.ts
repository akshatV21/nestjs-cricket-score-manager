import { ExecutionContext, createParamDecorator } from '@nestjs/common'

export const ReqUser = createParamDecorator((input: any, ctx: ExecutionContext) => {
  return ctx.switchToHttp().getRequest().user
})
