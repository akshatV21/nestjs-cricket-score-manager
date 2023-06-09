import { UserRepository } from '@lib/common'
import { BadRequestException, ContextType, Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { RegisterUserDto } from './dtos/register-user.dto'
import { sign, verify } from 'jsonwebtoken'
import { ConfigService } from '@nestjs/config'
import { CreateStatisticDto, EVENTS, EXCEPTION_MSGS, SERVICES, UserRegisteredDto } from '@lib/utils'
import { ClientProxy, RpcException } from '@nestjs/microservices'
import { LoginUserDto } from './dtos/login-user.dto'
import { compareSync } from 'bcrypt'
import { Types } from 'mongoose'

@Injectable()
export class AuthService {
  constructor(
    private readonly UserRepository: UserRepository,
    private readonly configService: ConfigService,
    @Inject(SERVICES.NOTIFICATIONS_SERVICE) private readonly notificationsService: ClientProxy,
    @Inject(SERVICES.STATISTICS_SERVICE) private readonly statisticsService: ClientProxy,
  ) {}

  async register(registerUserDto: RegisterUserDto) {
    const user = await this.UserRepository.create(registerUserDto)
    const emailValidationToken = sign({ id: user.id }, this.configService.get('JWT_SECRET'), { expiresIn: '2h' })
    // this.notificationsService.emit<any, UserRegisteredDto>(EVENTS.USER_REGISTERED, {
    //   jwt: emailValidationToken,
    //   email: user.email,
    //   name: `${user.firstName} ${user.lastName}`,
    // })
  }

  async login(loginUserDto: LoginUserDto) {
    const registeredUser = await this.UserRepository.findOne({ email: loginUserDto.email }, {}, { lean: true })
    if (!registeredUser) throw new BadRequestException('No user with provided email.')

    // if (!registeredUser.isEmailValidated) throw new UnauthorizedException('Please validate your email first.')

    const passwordMatches = compareSync(loginUserDto.password, registeredUser.password)
    if (!passwordMatches) throw new BadRequestException('Invalid password provided.')

    const token = sign({ id: registeredUser._id }, this.configService.get('JWT_SECRET'), { expiresIn: '24h' })
    const { password, ...rest } = registeredUser

    return { user: rest, token }
  }

  async validate(token: string) {
    const { id } = this.validateToken(token)
    const user = await this.UserRepository.findById(new Types.ObjectId(id))

    user.isEmailValidated = true
    await user.save()

    const payload: CreateStatisticDto = { token, body: { playerId: user._id } }
    this.statisticsService.emit(EVENTS.USER_EMAIL_VALIDATED, payload)
  }

  async resend(email: string) {
    const user = await this.UserRepository.findOne({ email: email })
    const emailValidationToken = sign({ id: user.id }, this.configService.get('JWT_SECRET'), { expiresIn: '2h' })
    this.notificationsService.emit<any, UserRegisteredDto>(EVENTS.USER_REGISTERED, {
      jwt: emailValidationToken,
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
    })
  }

  validateToken(token: string, type: ContextType = 'http'): any {
    return verify(token, this.configService.get('JWT_SECRET'), (err, payload) => {
      // when jwt is valid
      if (!err) return payload

      // when jwt has expired
      if (err.name === 'TokenExpiredError' && type === 'http') throw new UnauthorizedException('Token has expired')
      if (err.name === 'TokenExpiredError' && type === 'rpc') throw new RpcException(EXCEPTION_MSGS.JWT_EXPIRED)

      // throws error when jwt is malformed
      throw type === 'http'
        ? new UnauthorizedException('Invalid Jwt token', 'InvalidToken')
        : new RpcException(EXCEPTION_MSGS.INVALID_JWT)
    })
  }
}
