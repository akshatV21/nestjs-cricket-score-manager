import { UserRepository } from '@lib/common'
import { BadRequestException, CanActivate, ExecutionContext, Injectable } from '@nestjs/common'

@Injectable()
export class UniqueEmailGuard implements CanActivate {
  constructor(private readonly UserRepository: UserRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const email = request.body.email

    const user = await this.UserRepository.findOne({ email: email })
    if (user) throw new BadRequestException('Email is already in use.')

    return true
  }
}
