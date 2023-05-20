import { DynamicModule, Module } from '@nestjs/common'
import { RmqService } from './rmq.service'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { ConfigService } from '@nestjs/config'
import { Service } from '@lib/utils'

@Module({
  providers: [RmqService],
  exports: [RmqService],
})
export class RmqModule {
  static register(services: Service[]): DynamicModule {
    return {
      global: true,
      module: RmqModule,
      imports: [
        ClientsModule.registerAsync(
          services.map(service => ({
            name: service,
            useFactory: configService => ({
              transport: Transport.RMQ,
              options: {
                urls: [configService.get('RMQ_URL')],
                queue: configService.get(`RMQ_${service}_QUEUE`),
              },
            }),
            inject: [ConfigService],
          })),
        ),
      ],
      exports: [ClientsModule],
    }
  }
}
