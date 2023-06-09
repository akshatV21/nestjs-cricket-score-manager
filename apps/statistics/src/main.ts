import { NestFactory } from '@nestjs/core';
import { StatisticsModule } from './statistics.module';

async function bootstrap() {
  const app = await NestFactory.create(StatisticsModule);
  await app.listen(3000);
}
bootstrap();
