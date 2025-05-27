import { Body, Controller, Get, Logger, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../auth/decorators/user.decorator';
import { ContentService } from './content.service';
import { CreateContentDto } from './dto/create-content.dto';
import { ContentResponseDto } from './dto/content-response.dto';

@Controller('content')
export class ContentController {
  private readonly logger = new Logger(ContentController.name);

  constructor(private readonly contentService: ContentService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createContent(
    @Body() createContentDto: CreateContentDto,
    @User('id') userId: string,
  ): Promise<ContentResponseDto> {
    this.logger.log(`Received content submission from user ${userId}`);
    return this.contentService.createContent(createContentDto, userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getUserContent(@User('id') userId: string): Promise<ContentResponseDto[]> {
    this.logger.log(`Retrieving content for user ${userId}`);
    return this.contentService.getUserContent(userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getContentById(
    @Param('id') id: string, 
    @User('id') userId: string
  ): Promise<ContentResponseDto> {
    this.logger.log(`Retrieving content ${id} for user ${userId}`);
    return this.contentService.getContentById(id, userId);
  }
}
