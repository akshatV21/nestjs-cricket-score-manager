import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { StatisticsModule } from './statistics.module'
import { ConfigService } from '@nestjs/config'
import { RmqService } from '@lib/common'
import * as morgan from 'morgan'
import helmet from 'helmet'

async function bootstrap() {
  const app = await NestFactory.create(StatisticsModule, { cors: { origin: '*' } })

  const configService = app.get<ConfigService>(ConfigService)
  const rmqService = app.get<RmqService>(RmqService)

  const PORT = configService.get('PORT')

  app.connectMicroservice(rmqService.getOptions('TEAMS', true))
  app.useGlobalPipes(new ValidationPipe())

  app.use(helmet())
  app.use(morgan('dev'))

  await app.startAllMicroservices()
  await app.listen(PORT, () => console.log(`Statistics service listening to requests on port: ${PORT}`))
}
bootstrap()
