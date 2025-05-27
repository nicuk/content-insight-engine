import { Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ContentRepository } from '../database/content.repository';
import { ContentExtractorService } from './content-extractor.service';
import { ContentProcessingService } from '../processing/content-processing.service';
import { CreateContentDto } from './dto/create-content.dto';
import { ContentResponseDto } from './dto/content-response.dto';
import { ProcessingStatus } from '../database/enums/processing-status.enum';

@Injectable()
export class ContentService {
  private readonly logger = new Logger(ContentService.name);

  constructor(
    private readonly contentRepository: ContentRepository,
    private readonly contentExtractorService: ContentExtractorService,
    private readonly contentProcessingService: ContentProcessingService,
  ) {}

  /**
   * Creates a new content item and initiates processing
   */
  async createContent(
    createContentDto: CreateContentDto,
    userId: string,
  ): Promise<ContentResponseDto> {
    this.logger.log(`Creating content for user ${userId}`);
    
    try {
      let rawContent: string;
      
      // Handle different content sources
      if (createContentDto.sourceType === 'url') {
        // Extract content from URL using our custom extractor
        this.logger.log(`Extracting content from URL: ${createContentDto.sourceUrl}`);
        rawContent = await this.contentExtractorService.extractContent(
          createContentDto.sourceUrl,
        );
      } else {
        // Use directly provided text
        rawContent = createContentDto.rawContent;
      }
      
      // Save content to database
      const contentId = await this.contentRepository.create({
        userId,
        sourceType: createContentDto.sourceType,
        sourceUrl: createContentDto.sourceUrl,
        rawContent,
        status: ProcessingStatus.PENDING,
      });
      
      this.logger.log(`Content created with ID: ${contentId}`);
      
      // Initiate asynchronous processing
      await this.contentProcessingService.processContent(contentId);
      
      // Return the created content
      const content = await this.contentRepository.findById(contentId);
      return this.mapToResponseDto(content);
    } catch (error) {
      this.logger.error(`Error creating content: ${error.message}`);
      throw error;
    }
  }

  /**
   * Retrieves all content items for a user
   */
  async getUserContent(userId: string): Promise<ContentResponseDto[]> {
    this.logger.log(`Retrieving content for user ${userId}`);
    
    const contentItems = await this.contentRepository.findByUserId(userId);
    return contentItems.map(item => this.mapToResponseDto(item));
  }

  /**
   * Retrieves a specific content item by ID
   */
  async getContentById(id: string, userId: string): Promise<ContentResponseDto> {
    this.logger.log(`Retrieving content ${id} for user ${userId}`);
    
    const content = await this.contentRepository.findById(id);
    
    if (!content) {
      throw new NotFoundException(`Content with ID ${id} not found`);
    }
    
    // Ensure the content belongs to the requesting user
    if (content.userId !== userId) {
      throw new UnauthorizedException(
        'You do not have permission to access this content',
      );
    }
    
    return this.mapToResponseDto(content);
  }

  /**
   * Maps a content entity to a response DTO
   */
  private mapToResponseDto(content: any): ContentResponseDto {
    return {
      id: content.id,
      sourceType: content.sourceType,
      sourceUrl: content.sourceUrl,
      status: content.status,
      insights: content.insights,
      createdAt: content.createdAt,
    };
  }
}
