import { Module } from '@nestjs/common'
import { PerformanceService } from './performance.service'
import { PerformanceController } from './performance.controller'
import {
  DatabaseModule,
  Performance,
  PerformanceRepository,
  PerformanceSchema,
  User,
  UserRepository,
  UserSchema,
} from '@lib/common'

@Module({
  imports: [
    DatabaseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Performance.name, schema: PerformanceSchema },
    ]),
  ],
  controllers: [PerformanceController],
  providers: [PerformanceService, UserRepository, PerformanceRepository],
})
export class PerformanceModule {}
