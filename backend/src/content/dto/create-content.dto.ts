import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl, ValidateIf } from 'class-validator';

export enum ContentSourceType {
  TEXT = 'text',
  URL = 'url',
}

export class CreateContentDto {
  @IsNotEmpty()
  @IsEnum(ContentSourceType)
  sourceType: ContentSourceType;

  @ValidateIf(o => o.sourceType === ContentSourceType.URL)
  @IsNotEmpty()
  @IsUrl()
  sourceUrl: string;

  @ValidateIf(o => o.sourceType === ContentSourceType.TEXT)
  @IsNotEmpty()
  @IsString()
  rawContent: string;
}
