import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContentEntity } from './entities/content.entity';
import { ProcessingStatus } from './enums/processing-status.enum';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ContentRepository {
  constructor(
    @InjectRepository(ContentEntity)
    private contentRepository: Repository<ContentEntity>,
  ) {}

  async create(data: Partial<ContentEntity>): Promise<string> {
    const content = this.contentRepository.create({
      id: uuidv4(),
      ...data,
    });
    const savedContent = await this.contentRepository.save(content);
    return savedContent.id;
  }

  async findById(id: string): Promise<ContentEntity | null> {
    return this.contentRepository.findOne({ where: { id } });
  }

  async updateStatus(id: string, status: ProcessingStatus, errorMessage?: string): Promise<void> {
    const updateData: Partial<ContentEntity> = { status };
    if (errorMessage) {
      // You might want to store the error message in a field
      // For now, we'll just ignore it since the entity doesn't have an error field
    }
    await this.contentRepository.update(id, updateData);
  }

  async updateContent(id: string, data: Partial<ContentEntity>): Promise<void> {
    await this.contentRepository.update(id, data);
  }

  async saveInsights(id: string, insights: { summary: string; keywords: string[] }, status: ProcessingStatus): Promise<void> {
    await this.contentRepository.update(id, {
      summary: insights.summary,
      keywords: insights.keywords,
      status,
    });
  }
}
