import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { join } from "path";
import { ContentEntity } from "./entities/content.entity";
import { UserEntity } from "./entities/user.entity";
import { ContentRepository } from "./content.repository";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "sqlite",
      database: join(process.cwd(), "database.sqlite"),
      entities: [UserEntity, ContentEntity],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([UserEntity, ContentEntity]),
  ],
  providers: [ContentRepository],
  exports: [ContentRepository],
})
export class DatabaseModule {}

