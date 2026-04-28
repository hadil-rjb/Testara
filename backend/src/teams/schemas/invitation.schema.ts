import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { TeamRole } from './team.schema';

export type InvitationDocument = Invitation & Document;

export enum InvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REVOKED = 'revoked',
  EXPIRED = 'expired',
}

@Schema({ timestamps: true })
export class Invitation {
  @Prop({ type: Types.ObjectId, ref: 'Team', required: true, index: true })
  team: Types.ObjectId;

  /** Lower-cased email of the invitee — the only stable identifier pre-signup. */
  @Prop({ required: true, lowercase: true, trim: true, index: true })
  email: string;

  @Prop({ enum: TeamRole, required: true, default: TeamRole.VIEWER })
  role: TeamRole;

  @Prop({
    enum: InvitationStatus,
    required: true,
    default: InvitationStatus.PENDING,
    index: true,
  })
  status: InvitationStatus;

  /** Opaque random token used in the /invite/:token URL. */
  @Prop({ required: true, unique: true, index: true })
  token: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  invitedBy: Types.ObjectId;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop()
  acceptedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  acceptedBy?: Types.ObjectId;
}

export const InvitationSchema = SchemaFactory.createForClass(Invitation);

// Prevent two concurrent pending invitations for the same (team, email).
InvitationSchema.index(
  { team: 1, email: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: 'pending' } },
);
