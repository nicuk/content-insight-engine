import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ContentModule } from './content/content.module';

@Module({
  imports: [ContentModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
