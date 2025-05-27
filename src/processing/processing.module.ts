import { Module } from "@nestjs/common";
import { ContentProcessingService } from "./content-processing.service";
import { AiService } from "./ai.service";
import { ContentModule } from "../content/content.module";
import { DatabaseModule } from "../database/database.module";

@Module({
  imports: [ContentModule, DatabaseModule],
  providers: [ContentProcessingService, AiService],
  exports: [ContentProcessingService, AiService],
})
export class ProcessingModule {}
