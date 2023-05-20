import { UserRepository } from '@lib/common'
import { BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { RegisterUserDto } from './dtos/register-user.dto'
import { sign, verify } from 'jsonwebtoken'
import { ConfigService } from '@nestjs/config'
import { EVENTS, SERVICES, UserRegisteredDto } from '@lib/utils'
import { ClientProxy } from '@nestjs/microservices'
import { LoginUserDto } from './dtos/login-user.dto'
import { compareSync } from 'bcrypt'
import { Types } from 'mongoose'

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

  async login(loginUserDto: LoginUserDto) {
    const registeredUser = await this.UserRepository.findOne({ email: loginUserDto.email }, {}, { lean: true })
    if (!registeredUser) throw new BadRequestException('No user with provided email.')

    if (!registeredUser.isEmailValidated) throw new UnauthorizedException('Please validate your email first.')

    const passwordMatches = compareSync(loginUserDto.password, registeredUser.password)
    if (!passwordMatches) throw new BadRequestException('Invalid password provided.')

    const token = sign({ id: registeredUser._id }, this.configService.get('JWT_SECRET'), { expiresIn: '24h' })
    const { password, ...rest } = registeredUser

    return { user: rest, token }
  }

  async validate(token: string) {
    const userId = this.validateToken(token)
    const user = await this.UserRepository.findById(new Types.ObjectId(userId))

    user.isEmailValidated = true
    await user.save()
  }

  private validateToken(token: string): any {
    return verify(token, 'secret', (err, payload) => {
      // when jwt is valid
      if (!err) return payload

      // when jwt has expired
      if (err.name === 'TokenExpiredError') throw new UnauthorizedException('Token has expired')

      // throws error when jwt is malformed
      throw new UnauthorizedException('Invalid Jwt token', 'InvalidToken')
    })
  }
}
