import { NestFactory } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'
import helmet from 'helmet'
import * as morgan from 'morgan'
import { RmqService } from '@lib/common'
import { ValidationPipe } from '@nestjs/common'
import { MatchesModule } from './matches.module'

async function bootstrap() {
  const app = await NestFactory.create(MatchesModule, { cors: { origin: '*' } })

  const configService = app.get<ConfigService>(ConfigService)
  const rmqService = app.get<RmqService>(RmqService)

  const PORT = configService.get('PORT')

  app.connectMicroservice(rmqService.getOptions('TEAMS', true))
  app.useGlobalPipes(new ValidationPipe())

  app.use(helmet())
  app.use(morgan('dev'))

  await app.startAllMicroservices()
  await app.listen(PORT, () => console.log(`Matches service listening to requests on port: ${PORT}`))
}
bootstrap()
