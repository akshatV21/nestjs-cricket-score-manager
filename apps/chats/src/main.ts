import { NestFactory } from '@nestjs/core';
import { ChatsModule } from './chats.module';

async function bootstrap() {
  const app = await NestFactory.create(ChatsModule);
  await app.listen(3000);
}
bootstrap();
