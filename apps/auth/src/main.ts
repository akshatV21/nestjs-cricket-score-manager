import { NestFactory } from '@nestjs/core'
import { AuthModule } from './auth.module'
import { ConfigService } from '@nestjs/config'
import helmet from 'helmet'
import * as morgan from 'morgan'
import { ValidationPipe } from '@nestjs/common'
import { RmqService } from '@lib/common'

async function bootstrap() {
  const app = await NestFactory.create(AuthModule, { cors: { origin: '*' } })

  const configService = app.get<ConfigService>(ConfigService)
  const rmqService = app.get<RmqService>(RmqService)

  const PORT = configService.get('PORT')

  app.connectMicroservice(rmqService.getOptions('AUTH', true))
  app.useGlobalPipes(new ValidationPipe())

  app.use(helmet())
  app.use(morgan('dev'))

  await app.startAllMicroservices()
  await app.listen(PORT, () => console.log(`Auth service listening to requests on port: ${PORT}`))
}
bootstrap()
