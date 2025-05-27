import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ContentModule } from './content/content.module';
import { ProcessingModule } from './processing/processing.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    EventEmitterModule.forRoot(),
    DatabaseModule,
    ContentModule,
    ProcessingModule,
    AuthModule,
  ],
})
export class AppModule {}
