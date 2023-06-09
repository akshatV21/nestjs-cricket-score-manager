import { NestFactory } from '@nestjs/core'
import { NotificationsModule } from './notifications.module'
import { ConfigService } from '@nestjs/config'
import { RmqService } from '@lib/common'
import { ValidationPipe } from '@nestjs/common'
import helmet from 'helmet'
import * as morgan from 'morgan'

async function bootstrap() {
  const app = await NestFactory.create(NotificationsModule)

  const configService = app.get<ConfigService>(ConfigService)
  const rmqService = app.get<RmqService>(RmqService)

  const PORT = configService.get('PORT')

  app.connectMicroservice(rmqService.getOptions('NOTIFICATIONS', true))
  app.useGlobalPipes(new ValidationPipe())

  app.use(helmet())
  app.use(morgan('dev'))

  await app.startAllMicroservices()
  await app.listen(PORT, () => console.log(`Notifications service listening to requests on port: ${PORT}`))
}
bootstrap()
