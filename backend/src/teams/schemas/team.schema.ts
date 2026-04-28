import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TeamDocument = Team & Document;

export enum TeamRole {
  TESTER = 'tester',
  VIEWER = 'viewer',
}

@Schema({ _id: false })
export class TeamMember {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ enum: TeamRole, required: true, default: TeamRole.VIEWER })
  role: TeamRole;
}
export const TeamMemberSchema = SchemaFactory.createForClass(TeamMember);

@Schema({ timestamps: true })
export class Team {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ trim: true })
  description?: string;

  /**
   * The enterprise user that owns this team. Only the owner can
   * update/delete the team and manage its members / project access.
   */
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  owner: Types.ObjectId;

  @Prop({ type: [TeamMemberSchema], default: [] })
  members: TeamMember[];

  /**
   * Projects this team has been granted access to. All members
   * (regardless of role) can see these projects; role governs
   * what they can do within each project.
   */
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Project' }], default: [] })
  projects: Types.ObjectId[];
}

export const TeamSchema = SchemaFactory.createForClass(Team);
