import { UserDocument } from '@lib/common/database'
import { AuthOptions, AuthorizeDto, EVENTS, EXCEPTION_MSGS, SERVICES, catchAuthErrors } from '@lib/utils'
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
import { WsException } from '@nestjs/websockets'
import { Types } from 'mongoose'
import { lastValueFrom } from 'rxjs'

@Injectable()
export class Authorize implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(SERVICES.AUTH_SERVICE) private readonly authService: ClientProxy,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const type = context.getType()
    console.log(type)
    if (type === 'http') return this.authorizeHttpRequest(context)
    else if (type === 'rpc') return this.authorizeRpcRequest(context)
    else if (type === 'ws') return this.authorizeWsRequest(context)
  }

  private authorizeHttpRequest(context: ExecutionContext) {
    const { isLive, isOpen, types } = this.reflector.get<AuthOptions>('authOptions', context.getHandler())

    if (!isLive) throw new InternalServerErrorException('This endpoint is currently under maintainence.')
    if (isOpen) return true

    const request = context.switchToHttp().getRequest()
    const authHeader = request.headers['authorization']
    if (!authHeader) throw new UnauthorizedException('No authorization header provided')

    const token = authHeader.split(' ')[1]
    return this.sendAuthorizationRequest({ token, types, requestContextType: 'http' }, request, 'http')
  }

  private authorizeRpcRequest(context: ExecutionContext) {
    const { isLive, isOpen, types } = this.reflector.get<AuthOptions>('authOptions', context.getHandler())

    if (!isLive) throw new RpcException('This endpoint is currently under maintainence.')
    if (isOpen) return true

    const data = context.switchToRpc().getData()
    const token = data.token

    return this.sendAuthorizationRequest({ token, types, requestContextType: 'rpc' }, data, 'rpc')
  }

  private authorizeWsRequest(context: ExecutionContext) {
    const { isLive, isOpen, types } = this.reflector.get<AuthOptions>('authOptions', context.getHandler())

    if (!isLive) throw new WsException('This endpoint is currently under maintainence.')
    if (isOpen) return true

    const request = context.switchToWs().getClient()
    const token = request.handshake.auth.token

    return this.sendAuthorizationRequest({ token, types, requestContextType: 'ws' }, request, 'ws')
  }

  private async sendAuthorizationRequest(authorizeDto: AuthorizeDto, request: any, type: ContextType) {
    const response = await lastValueFrom(
      this.authService.send<any, AuthorizeDto>(EVENTS.AUTHORIZE, authorizeDto),
    ).catch(err => {
      catchAuthErrors(err, type)
    })

    if (type === 'ws') {
      request.entityId = response.userId
    } else if (type === 'http') {
      response.user._id = new Types.ObjectId(response.user._id)
      request.user = response.user
      request.token = authorizeDto.token
    }
    return true
  }
}
