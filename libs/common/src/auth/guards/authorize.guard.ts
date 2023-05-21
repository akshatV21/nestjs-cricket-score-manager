import { UserDocument } from '@lib/common/database'
import { AuthOptions, AuthorizeDto, EVENTS, SERVICES } from '@lib/utils'
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ClientProxy } from '@nestjs/microservices'
import { Observable, lastValueFrom } from 'rxjs'

@Injectable()
export class Authorize implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(SERVICES.AUTH_SERVICE) private readonly authService: ClientProxy,
  ) {}

  async canActivate(context: ExecutionContext) {
    const type = context.getType()

    if (type === 'http') return this.authorizeHttpRequest(context)
  }

  private async authorizeHttpRequest(context: ExecutionContext) {
    const { isLive, isOpen, types } = this.reflector.get<AuthOptions>('authOptions', context.getHandler())

    if (!isLive) throw new InternalServerErrorException('This endpoint is currently under maintainence.')
    if (isOpen) return true

    const request = context.switchToHttp().getRequest()
    const authHeader = request.headers['authorization']
    if (!authHeader) throw new UnauthorizedException('No authorization header provided')

    const token = authHeader.split(' ')[1]

    const { user } = await lastValueFrom(
      this.authService.send<any, AuthorizeDto>(EVENTS.AUTHORIZE, { token, types }),
    ).catch(err => {
      throw new ForbiddenException()
    })

    request.user = user
    return true
  }

  private authorizeRpcRequest(context: ExecutionContext) {}
}
