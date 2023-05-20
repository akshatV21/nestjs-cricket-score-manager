import { UserRepository } from '@lib/common'
import { Inject, Injectable } from '@nestjs/common'
import { RegisterUserDto } from './dtos/register-user.dto'
import { sign } from 'jsonwebtoken'
import { ConfigService } from '@nestjs/config'
import { EVENTS, SERVICES, UserRegisteredDto } from '@lib/utils'
import { ClientProxy } from '@nestjs/microservices'

@Injectable()
export class AuthService {
  constructor(
    private readonly UserRepository: UserRepository,
    private readonly configService: ConfigService,
    @Inject(SERVICES.NOTIFICATIONS_SERVICE) private readonly notificationsService: ClientProxy,
  ) {}

  async register(registerUserDto: RegisterUserDto) {
    const user = await this.UserRepository.create(registerUserDto)
    const emailValidationToken = sign(user.id, this.configService.get('JWT_SECRET'), { expiresIn: '1h' })
    this.notificationsService.emit<any, UserRegisteredDto>(EVENTS.USER_REGISTERED, {
      token: emailValidationToken,
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
    })
  }
}
