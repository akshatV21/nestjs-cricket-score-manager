import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import * as Joi from 'joi'
import { SERVICES } from '@lib/utils'
import { RmqModule, DatabaseModule, Authorize } from '@lib/common'
import { APP_GUARD } from '@nestjs/core'
import { StatisticsModule } from './statistics/statistics.module'
import { PerformanceModule } from './performance/performance.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().required(),
        MONGO_URI: Joi.string().required(),
        RMQ_URL: Joi.string().required(),
        RMQ_AUTH_QUEUE: Joi.string().required(),
        RMQ_NOTIFICATIONS_QUEUE: Joi.string().required(),
        RMQ_TEAMS_QUEUE: Joi.string().required(),
        RMQ_MATCHES_QUEUE: Joi.string().required(),
        RMQ_STATISTICS_QUEUE: Joi.string().required(),
      }),
    }),
    RmqModule.register([SERVICES.AUTH_SERVICE, SERVICES.NOTIFICATIONS_SERVICE, SERVICES.MATCH_SERVICE]),
    DatabaseModule,
    StatisticsModule,
    PerformanceModule,
  ],
  controllers: [],
  providers: [{ provide: APP_GUARD, useClass: Authorize }],
})
export class AppModule {}
