import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ContentRepository } from '../database/content.repository';
import { ProcessingStatus } from '../database/enums/processing-status.enum';
import { ContentExtractorService } from '../content/content-extractor.service';
import { AiService } from './ai.service';

// Event classes
export class ContentSubmittedEvent {
  constructor(
    public readonly contentId: string,
    public readonly url: string,
  ) {}
}

export class ContentProcessedEvent {
  constructor(public readonly contentId: string) {}
}

export class ContentFailedEvent {
  constructor(
    public readonly contentId: string,
    public readonly error: string,
  ) {}
}

@Injectable()
export class ContentProcessingService implements OnModuleInit {
  private readonly logger = new Logger(ContentProcessingService.name);

  constructor(
    private eventEmitter: EventEmitter2,
    private contentRepository: ContentRepository,
    private contentExtractorService: ContentExtractorService,
    private aiService: AiService,
  ) {}

  onModuleInit() {
    // Register event listeners
    this.eventEmitter.on('content.submitted', (event: ContentSubmittedEvent) => {
      this.processContent(event).catch(error => {
        this.logger.error(`Unhandled error in content processing: ${error.message}`, error.stack);
      });
    });
  }

  /**
   * Process content after submission
   * This is an asynchronous process triggered by events
   */
  async processContent(event: ContentSubmittedEvent): Promise<void> {
    this.logger.log(`Processing content: ${event.contentId} from URL: ${event.url}`);

    try {
      // Update status to processing
      await this.contentRepository.updateStatus(
        event.contentId,
        ProcessingStatus.PROCESSING
      );

      // Extract content from URL
      this.logger.log(`Extracting content from URL: ${event.url}`);
      const extractedContent = await this.contentExtractorService.extractContent(event.url);

      // Store the raw content
      await this.contentRepository.updateContent(event.contentId, {
        rawContent: extractedContent,
      });

      // Generate AI insights
      this.logger.log(`Generating AI insights for content: ${event.contentId}`);
      
      // Generate summary using AI
      const summary = await this.aiService.generateSummary(extractedContent);
      
      // Extract keywords using AI
      const keywords = await this.aiService.extractKeywords(extractedContent);
      
      this.logger.log(`AI processing complete, saving insights...`);
      
      // Store results
      await this.contentRepository.saveInsights(
        event.contentId,
        { summary, keywords },
        ProcessingStatus.COMPLETED
      );
      
      this.logger.log(`Processing completed successfully for content: ${event.contentId}`);
      
      // Emit completion event for any listeners
      this.eventEmitter.emit(
        'content.processed',
        new ContentProcessedEvent(event.contentId)
      );
    } catch (error: any) {
      this.logger.error(
        `Error processing content ${event.contentId}: ${error.message}`,
        error.stack,
      );
      
      // Update content status to failed
      await this.contentRepository.updateStatus(
        event.contentId,
        ProcessingStatus.FAILED
      );
      
      // Emit failure event
      this.eventEmitter.emit(
        'content.failed',
        new ContentFailedEvent(event.contentId, error.message)
      );
    }
  }

  /**
   * Submit content for processing
   * This is the entry point for the content processing flow
   */
  async submitContent(url: string): Promise<string> {
    this.logger.log(`Submitting content from URL: ${url}`);

    // Create content record in pending state
    const contentId = await this.contentRepository.create({
      url,
      status: ProcessingStatus.PENDING,
    });

    // Emit event to trigger asynchronous processing
    this.eventEmitter.emit(
      'content.submitted',
      new ContentSubmittedEvent(contentId, url)
    );

    return contentId;
  }
}
