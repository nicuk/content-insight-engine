import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from "typeorm";
import { ProcessingStatus } from "../enums/processing-status.enum";

@Entity("content")
export class ContentEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  userId: string;

  @Column()
  sourceType: string;

  @Column({ nullable: true })
  sourceUrl: string;

  @Column({ type: "text" })
  rawContent: string;

  @Column()
  status: ProcessingStatus;

  @Column({ type: "json", nullable: true })
  insights: {
    summary?: string;
    keywords?: string[];
  };

  @Column({ nullable: true })
  errorMessage: string;

  @CreateDateColumn()
  createdAt: Date;
}
