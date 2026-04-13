import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProjectDocument = Project & Document;

export enum ProjectStatus {
  CRAWL = 'crawl',
  TESTING = 'testing',
  COMPLETED = 'completed',
}

@Schema({ timestamps: true })
export class Project {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  url: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner: Types.ObjectId;

  @Prop({ enum: ProjectStatus, default: ProjectStatus.CRAWL })
  status: ProjectStatus;

  @Prop()
  environment?: string;

  @Prop({ default: 0 })
  totalScenarios: number;

  @Prop({ default: 0 })
  passedScenarios: number;

  @Prop({ default: 0 })
  failedScenarios: number;

  @Prop()
  duration?: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  members: Types.ObjectId[];
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
