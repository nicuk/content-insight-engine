import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ContentRepository } from '../database/content.repository';
import { ProcessingStatus } from '../database/enums/processing-status.enum';
import { AiService } from './ai.service';

// Event classes for the event-driven architecture
export class ContentSubmittedEvent {
  constructor(public readonly contentId: string) {}
}

export class ContentProcessedEvent {
  constructor(public readonly contentId: string) {}
}

export class ContentFailedEvent {
  constructor(
    public readonly contentId: string,
    public readonly error: Error,
  ) {}
}

@Injectable()
export class ContentProcessingService implements OnModuleInit {
  private readonly logger = new Logger(ContentProcessingService.name);

  constructor(
    private eventEmitter: EventEmitter2,
    private aiService: AiService,
    private contentRepository: ContentRepository,
  ) {}

  /**
   * Initiates asynchronous processing of content
   * This method updates the status and emits an event for async processing
   */
  async processContent(contentId: string): Promise<void> {
    try {
      this.logger.log(`Initiating processing for content: ${contentId}`);
      
      // Update status to processing
      await this.contentRepository.updateStatus(
        contentId, 
        ProcessingStatus.PROCESSING
      );
      
      // Emit event for async processing
      this.eventEmitter.emit(
        'content.submitted',
        new ContentSubmittedEvent(contentId)
      );
      
      this.logger.log(`Processing event emitted for content: ${contentId}`);
    } catch (error: any) {
      this.logger.error(`Error initiating processing: ${error.message}`);
      throw new Error(`Failed to initiate processing: ${error.message}`);
    }
  }
  
  /**
   * Set up event listeners when the module initializes
   */
  onModuleInit() {
    // Set up event listeners
    this.eventEmitter.on('content.submitted', this.handleContentSubmitted.bind(this));
    this.eventEmitter.on('content.failed', this.handleContentFailed.bind(this));
  }

  /**
   * Handles the content.submitted event
   * This is where the actual AI processing happens asynchronously
   */
  private async handleContentSubmitted(event: ContentSubmittedEvent): Promise<void> {
    this.logger.log(`Processing content: ${event.contentId}`);
    
    try {
      // Retrieve content from repository
      const content = await this.contentRepository.findById(event.contentId);
      
      if (!content) {
        throw new Error(`Content not found: ${event.contentId}`);
      }
      
      this.logger.log(`Retrieved content, processing with AI...`);
      
      // Process with AI in parallel for efficiency
      const [summary, keywords] = await Promise.all([
        this.aiService.generateSummary(content.rawContent),
        this.aiService.extractKeywords(content.rawContent),
      ]);
      
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
        ProcessingStatus.FAILED,
        error.message
      );
      
      // Emit failure event
      this.eventEmitter.emit(
        'content.failed',
        new ContentFailedEvent(event.contentId, new Error(error.message))
      );
    }
  }
  
  /**
   * Handles content processing failures
   * Could be extended to implement retry logic or notifications
   */
  private handleContentFailed(event: ContentFailedEvent): void {
    this.logger.error(
      `Content processing failed for ${event.contentId}: ${event.error.message}`,
    );
    
    // Additional failure handling could be implemented here
    // For example, retry logic or notifications
  }
  
  /**
   * Retrieves the processing status of content
   */
  async getProcessingStatus(contentId: string): Promise<ProcessingStatus> {
    const content = await this.contentRepository.findById(contentId);
    
    if (!content) {
      throw new Error(`Content not found: ${contentId}`);
    }
    
    return content.status;
  }
}
