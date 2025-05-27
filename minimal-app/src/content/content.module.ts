import { Module } from '@nestjs/common';
import { ContentExtractorService } from './content-extractor.service';
import { ContentController } from './content.controller';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [AiModule],
  providers: [ContentExtractorService],
  controllers: [ContentController],
  exports: [ContentExtractorService],
})
export class ContentModule {}
