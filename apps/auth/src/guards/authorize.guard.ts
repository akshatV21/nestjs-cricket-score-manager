import { AuthorizeDto, EXCEPTION_MSGS } from '@lib/utils'
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { RpcException } from '@nestjs/microservices'
import { AuthService } from '../auth.service'
import { UserRepository } from '@lib/common'
import { Types } from 'mongoose'

@Injectable()
export class Authorize implements CanActivate {
  constructor(private readonly authService: AuthService, private readonly UserRepository: UserRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const data = context.switchToRpc().getData<AuthorizeDto>()
    
    const types = data.types
    const token = data.token
    const requestType = data.requestType

    if (!token) throw new RpcException(EXCEPTION_MSGS.NULL_TOKEN)

    const { id } = this.authService.validateToken(token, 'rpc')
    
    if (requestType === 'rpc') return true

    const user = await this.UserRepository.findById(new Types.ObjectId(id))
    
    if (!user.isEmailValidated) throw new RpcException(EXCEPTION_MSGS.UNVERIFIED_EMAIL)
    if (!types.includes(user.type)) throw new RpcException(EXCEPTION_MSGS.UNAUTHORIZED)

    data.user = user
    return true
  }
}
