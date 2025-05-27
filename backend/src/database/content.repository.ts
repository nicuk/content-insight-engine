import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ContentEntity } from "./entities/content.entity";
import { ProcessingStatus } from "./enums/processing-status.enum";

@Injectable()
export class ContentRepository {
  constructor(
    @InjectRepository(ContentEntity)
    private contentRepository: Repository<ContentEntity>,
  ) {}

  async create(data: Partial<ContentEntity>): Promise<string> {
    const content = this.contentRepository.create(data);
    const savedContent = await this.contentRepository.save(content);
    return savedContent.id;
  }

  async findById(id: string): Promise<ContentEntity> {
    return this.contentRepository.findOne({ where: { id } });
  }

  async findByUserId(userId: string): Promise<ContentEntity[]> {
    return this.contentRepository.find({
      where: { userId },
      order: { createdAt: "DESC" },
    });
  }

  async updateStatus(
    id: string,
    status: ProcessingStatus,
    errorMessage?: string,
  ): Promise<void> {
    await this.contentRepository.update(id, { status, errorMessage });
  }

  async saveInsights(
    id: string,
    insights: any,
    status: ProcessingStatus,
  ): Promise<void> {
    await this.contentRepository.update(id, { insights, status });
  }
}
