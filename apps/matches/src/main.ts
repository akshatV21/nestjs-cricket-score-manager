import { NestFactory } from '@nestjs/core';
import { MatchesModule } from './matches.module';

async function bootstrap() {
  const app = await NestFactory.create(MatchesModule);
  await app.listen(3000);
}
bootstrap();
