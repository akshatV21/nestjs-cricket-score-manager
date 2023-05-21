import { NestFactory } from '@nestjs/core'
import { TeamsModule } from './teams.module'
import { ConfigService } from '@nestjs/config'
import helmet from 'helmet'
import * as morgan from 'morgan'
import { RmqService } from '@lib/common'
import { ValidationPipe } from '@nestjs/common'

async function bootstrap() {
  const app = await NestFactory.create(TeamsModule)

  const configService = app.get<ConfigService>(ConfigService)
  const rmqService = app.get<RmqService>(RmqService)

  const PORT = configService.get('PORT')

  app.connectMicroservice(rmqService.getOptions('TEAMS', true))
  app.useGlobalPipes(new ValidationPipe())

  app.use(helmet())
  app.use(morgan('dev'))

  await app.startAllMicroservices()
  await app.listen(PORT, () => console.log(`Teams service listening to requests on port: ${PORT}`))
}
bootstrap()
