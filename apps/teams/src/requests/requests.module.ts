import { Module } from '@nestjs/common'
import { RequestsService } from './requests.service'
import {
  DatabaseModule,
  Request,
  RequestRepository,
  RequestSchema,
  Team,
  TeamRepository,
  TeamSchema,
  User,
  UserRepository,
  UserSchema,
} from '@lib/common'

@Module({
  imports: [
    DatabaseModule.forFeature([
      { name: Request.name, schema: RequestSchema },
      { name: User.name, schema: UserSchema },
      { name: Team.name, schema: TeamSchema },
    ]),
  ],
  providers: [RequestsService, RequestRepository, UserRepository, TeamRepository],
  exports: [RequestsService],
})
export class RequestsModule {}
