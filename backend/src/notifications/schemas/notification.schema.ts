import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NotificationDocument = Notification & Document;

/**
 * Every notification kind the platform can emit.
 *
 * The `type` is the contract the frontend uses to pick an icon, copy
 * key, and (where relevant) the action buttons (e.g. accept / decline).
 */
export enum NotificationType {
  /** A QA manager invited an existing user to a team. The invitee can
   *  accept or decline directly from the dashboard. */
  INVITATION_RECEIVED = 'invitation_received',
  /** Sent to the inviter when their invitee accepts. */
  INVITATION_ACCEPTED = 'invitation_accepted',
  /** Sent to the inviter when their invitee declines. */
  INVITATION_DECLINED = 'invitation_declined',
  /** A team the user belongs to was granted access to a project. */
  PROJECT_ACCESS_GRANTED = 'project_access_granted',
  /** A team the user belongs to lost access to a project. */
  PROJECT_ACCESS_REVOKED = 'project_access_revoked',
  /** The user was removed from a team. */
  TEAM_MEMBERSHIP_REMOVED = 'team_membership_removed',
  /** The user's role within a team was updated. */
  TEAM_ROLE_CHANGED = 'team_role_changed',
  /** A team the user belonged to was deleted. */
  TEAM_DELETED = 'team_deleted',
}

/**
 * A notification represents a single in-app event for a single user.
 *
 * Design notes:
 *   - `data` is a permissive sub-document so each `type` can stash
 *     whatever it needs (team id, project name, role, invitation id, …)
 *     without polluting the top-level schema.
 *   - `actionable` flags notifications that have a pending action
 *     attached (accept/decline an invitation). When the action is
 *     resolved we flip this off so the buttons disappear from the UI.
 */
@Schema({ timestamps: true })
export class Notification {
  /** The recipient. Indexed for fast per-user list queries. */
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  user: Types.ObjectId;

  @Prop({ enum: NotificationType, required: true, index: true })
  type: NotificationType;

  /** A short heading shown in bold in the panel. Plain text. */
  @Prop({ required: true, trim: true })
  title: string;

  /** A longer one-liner shown under the title. Plain text. */
  @Prop({ trim: true })
  message?: string;

  /** Free-form metadata; consumers cast based on `type`. */
  @Prop({ type: Object, default: {} })
  data: Record<string, unknown>;

  /** Has the user opened the notifications panel since this arrived. */
  @Prop({ default: false, index: true })
  read: boolean;

  /** Does this notification still expose action buttons (accept/decline)? */
  @Prop({ default: false })
  actionable: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

// Most queries are "give me my recent notifications" — index supports it.
NotificationSchema.index({ user: 1, createdAt: -1 });
