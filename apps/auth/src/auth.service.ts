import { UserRepository } from '@lib/common'
import { Injectable } from '@nestjs/common'
import { RegisterUserDto } from './dtos/register-user.dto'

@Injectable()
export class AuthService {
  constructor(private readonly UserRepository: UserRepository) {}

  async register(registerUserDto: RegisterUserDto) {}
}
