import { UserDocument } from '@lib/common/database'
import { AuthOptions, AuthorizeDto, EVENTS, EXCEPTION_MSGS, SERVICES } from '@lib/utils'
import {
  CanActivate,
  ContextType,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ClientProxy, RpcException } from '@nestjs/microservices'
import { lastValueFrom } from 'rxjs'

@Injectable()
export class Authorize implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(SERVICES.AUTH_SERVICE) private readonly authService: ClientProxy,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const type = context.getType()
    
    if (type === 'http') return this.authorizeHttpRequest(context)
    else if (type === 'rpc') return this.authorizeRpcRequest(context)
  }

  private authorizeHttpRequest(context: ExecutionContext) {
    const { isLive, isOpen, types } = this.reflector.get<AuthOptions>('authOptions', context.getHandler())

    if (!isLive) throw new InternalServerErrorException('This endpoint is currently under maintainence.')
    if (isOpen) return true

    const request = context.switchToHttp().getRequest()
    const authHeader = request.headers['authorization']
    if (!authHeader) throw new UnauthorizedException('No authorization header provided')
    
    const token = authHeader.split(' ')[1]
    return this.sendAuthorizationRequest({ token, types, requestType: 'http' }, request, 'http')
  }

  private authorizeRpcRequest(context: ExecutionContext) {
    const { isLive, isOpen, types } = this.reflector.get<AuthOptions>('authOptions', context.getHandler())

    if (!isLive) throw new RpcException('This endpoint is currently under maintainence.')
    if (isOpen) return true

    const data = context.switchToRpc().getData()
    const token = data.token

    return this.sendAuthorizationRequest({ token, types, requestType: 'rpc' }, data, 'rpc')
  }

  private async sendAuthorizationRequest(authorizeDto: AuthorizeDto, request: any, type: ContextType) {
    const response = await lastValueFrom(
      this.authService.send<any, AuthorizeDto>(EVENTS.AUTHORIZE, authorizeDto),
    ).catch(err => {
      console.log(err)
      switch (err.message) {
        case EXCEPTION_MSGS.NULL_TOKEN:
          throw type === 'http'
            ? new UnauthorizedException('Please log in first.')
            : new RpcException('Please log in first.')
        case EXCEPTION_MSGS.UNAUTHORIZED:
          throw type === 'http'
            ? new ForbiddenException('You are not authorized to access this endpoint.')
            : new RpcException('You are not authorized to access this endpoint.')
        case EXCEPTION_MSGS.JWT_EXPIRED:
          throw type === 'http'
            ? new UnauthorizedException('You token has expired. Please log in again.')
            : new RpcException('You token has expired. Please log in again.')
        case EXCEPTION_MSGS.UNVERIFIED_EMAIL:
          throw type === 'http'
            ? new UnauthorizedException('Please verify your email first.')
            : new RpcException('Please verify your email first.')
        default:
          throw type === 'http'
            ? new UnauthorizedException('Invalid Jwt.')
            : new RpcException('Invalid Jwt.')

      }
    })
    
    request.user = response.user
    return true
  }
}
