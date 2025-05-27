import { ProcessingStatus } from '../../database/enums/processing-status.enum';

export class ContentResponseDto {
  id: string;
  sourceType: string;
  sourceUrl?: string;
  status: ProcessingStatus;
  insights?: {
    summary?: string;
    keywords?: string[];
  };
  createdAt: Date;
}
