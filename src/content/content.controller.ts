import { Controller, Post, Body, Get } from '@nestjs/common';
import { ContentExtractorService } from './content-extractor.service';
import { AiService } from '../ai/ai.service';

@Controller('content')
export class ContentController {
  constructor(
    private readonly contentExtractorService: ContentExtractorService,
    private readonly aiService: AiService,
  ) {}

  @Post('extract')
  async extractContent(@Body() body: { url: string }) {
    const content = await this.contentExtractorService.extractContent(body.url);
    return { content: content.substring(0, 1000) + '...' }; // Truncate for readability
  }

  @Post('analyze')
  async analyzeContent(@Body() body: { url: string }) {
    const content = await this.contentExtractorService.extractContent(body.url);
    const summary = await this.aiService.generateSummary(content);
    const keywords = await this.aiService.extractKeywords(content);
    
    return {
      summary,
      keywords,
      contentPreview: content.substring(0, 300) + '...' // Short preview of the content
    };
  }

  @Get('test')
  async testExtraction() {
    return { message: 'Content extraction service is working!' };
  }
}
