import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common'
import { AuthService } from './auth.service'
import { RegisterUserDto } from './dtos/register-user.dto'
import { LoginUserDto } from './dtos/login-user.dto'
import { UniqueEmailGuard } from './guards/unique-email.guard'
import { Auth } from '@lib/common'
import { MessagePattern, Payload } from '@nestjs/microservices'
import { AuthorizeDto, EVENTS } from '@lib/utils'
import { Authorize } from './guards/authorize.guard'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Auth({ isOpen: true })
  @UseGuards(UniqueEmailGuard)
  async httpRegisterUser(@Body() registerUserDto: RegisterUserDto) {
    await this.authService.register(registerUserDto)
    return { success: true, message: 'User registered successfully' }
  }

  @Post('login')
  @Auth({ isOpen: true })
  async httpLoginUser(@Body() loginUserDto: LoginUserDto) {
    const loginPayload = await this.authService.login(loginUserDto)
    return { success: true, message: 'User logged in successfully', data: loginPayload }
  }

  @Get('validate')
  @Auth({ isOpen: true })
  async httpValidateEmailVerificationToken(@Query('token') token: string) {
    await this.authService.validate(token)
    return { success: true, message: 'Email validated successfully.' }
  }

  @Get('resend')
  @Auth({ isOpen: true })
  async httpResendEmailVerificationMail(@Query('email') email: string) {
    await this.authService.resend(email)
    return { success: true, message: 'Email sent successfully.' }
  }

  @MessagePattern(EVENTS.AUTHORIZE)
  @UseGuards(Authorize)
  authorize(@Payload() payload: AuthorizeDto) {
    return { user: payload.user, userId: payload.userId }
  }
}
