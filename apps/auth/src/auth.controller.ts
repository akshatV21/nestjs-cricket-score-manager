import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common'
import { AuthService } from './auth.service'
import { RegisterUserDto } from './dtos/register-user.dto'
import { LoginUserDto } from './dtos/login-user.dto'
import { UniqueEmailGuard } from './guards/unique-email.guard'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @UseGuards(UniqueEmailGuard)
  async httpRegisterUser(@Body() registerUserDto: RegisterUserDto) {
    await this.authService.register(registerUserDto)
    return { success: true, message: 'User registered successfully' }
  }

  @Post('login')
  async httpLoginUser(@Body() loginUserDto: LoginUserDto) {
    const loginPayload = await this.authService.login(loginUserDto)
    return { success: true, message: 'User logged in successfully', data: loginPayload }
  }

  @Get('validate')
  async httpValidateEmailVerificationToken(@Query('token') token: string) {
    await this.authService.validate(token)
    return { success: true, message: 'Email validated successfully.' }
  }
}
