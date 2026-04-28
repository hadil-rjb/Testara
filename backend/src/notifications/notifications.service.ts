import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Notification,
  NotificationDocument,
  NotificationType,
} from './schemas/notification.schema';

/**
 * Safely coerce a value to Types.ObjectId.
 *
 * The codebase has had subtle Mongoose ObjectId-cast bugs (string-vs-ObjectId
 * mismatches that silently return empty result sets), so every id that
 * crosses the service boundary goes through this guard.
 */
function toObjectId(id: unknown): Types.ObjectId | null {
  if (!id) return null;
  if (id instanceof Types.ObjectId) return id;
  const s = String(id);
  return Types.ObjectId.isValid(s) ? new Types.ObjectId(s) : null;
}

export interface CreateNotificationPayload {
  user: string | Types.ObjectId;
  type: NotificationType;
  title: string;
  message?: string;
  data?: Record<string, unknown>;
  actionable?: boolean;
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
  ) {}

  // ──────────────────── Public emit API ────────────────────

  /**
   * Create one notification for one user. Used by other domain services
   * (teams, projects, …) to fan events out to the user's dashboard.
   *
   * Failures are swallowed by callers so a notification persistence error
   * never blocks the underlying business action. The caller decides
   * whether to log.
   */
  async create(payload: CreateNotificationPayload): Promise<NotificationDocument | null> {
    const userOid = toObjectId(payload.user);
    if (!userOid) return null;

    const doc = await this.notificationModel.create({
      user: userOid,
      type: payload.type,
      title: payload.title,
      message: payload.message,
      data: payload.data ?? {},
      actionable: payload.actionable ?? false,
      read: false,
    });
    return doc;
  }

  /** Bulk variant — used when a single event applies to many recipients
   *  (e.g. team-wide project access change). */
  async createMany(payloads: CreateNotificationPayload[]): Promise<void> {
    if (payloads.length === 0) return;
    const docs = payloads
      .map((p) => {
        const userOid = toObjectId(p.user);
        if (!userOid) return null;
        return {
          user: userOid,
          type: p.type,
          title: p.title,
          message: p.message,
          data: p.data ?? {},
          actionable: p.actionable ?? false,
          read: false,
        };
      })
      .filter((d): d is NonNullable<typeof d> => d !== null);
    if (docs.length === 0) return;
    await this.notificationModel.insertMany(docs);
  }

  /**
   * When an invitation is resolved (accepted, declined, revoked, deleted)
   * we deactivate every actionable notification that referenced it so the
   * user can no longer click stale Accept / Decline buttons.
   */
  async deactivateForInvitation(invitationId: string | Types.ObjectId): Promise<void> {
    const invOid = toObjectId(invitationId);
    if (!invOid) return;
    await this.notificationModel.updateMany(
      { 'data.invitationId': String(invOid), actionable: true },
      { $set: { actionable: false } },
    );
  }

  // ──────────────────── User-facing API ────────────────────

  async listForUser(
    userId: string,
    opts: { limit?: number; unreadOnly?: boolean } = {},
  ): Promise<NotificationDocument[]> {
    const userOid = toObjectId(userId);
    if (!userOid) return [];
    const filter: Record<string, unknown> = { user: userOid };
    if (opts.unreadOnly) filter.read = false;
    return this.notificationModel
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(Math.min(Math.max(opts.limit ?? 50, 1), 200))
      .exec();
  }

  async unreadCount(userId: string): Promise<number> {
    const userOid = toObjectId(userId);
    if (!userOid) return 0;
    return this.notificationModel.countDocuments({ user: userOid, read: false });
  }

  async markAllRead(userId: string): Promise<void> {
    const userOid = toObjectId(userId);
    if (!userOid) return;
    await this.notificationModel.updateMany(
      { user: userOid, read: false },
      { $set: { read: true } },
    );
  }

  async markRead(userId: string, notificationId: string): Promise<NotificationDocument> {
    const userOid = toObjectId(userId);
    const notifOid = toObjectId(notificationId);
    if (!userOid || !notifOid) {
      throw new NotFoundException('Notification introuvable');
    }
    const notif = await this.notificationModel.findOneAndUpdate(
      { _id: notifOid, user: userOid },
      { $set: { read: true } },
      { new: true },
    );
    if (!notif) throw new NotFoundException('Notification introuvable');
    return notif;
  }

  async dismiss(userId: string, notificationId: string): Promise<void> {
    const userOid = toObjectId(userId);
    const notifOid = toObjectId(notificationId);
    if (!userOid || !notifOid) {
      throw new NotFoundException('Notification introuvable');
    }
    const result = await this.notificationModel.deleteOne({
      _id: notifOid,
      user: userOid,
    });
    if (result.deletedCount === 0) {
      throw new NotFoundException('Notification introuvable');
    }
  }

  async clearAll(userId: string): Promise<void> {
    const userOid = toObjectId(userId);
    if (!userOid) return;
    await this.notificationModel.deleteMany({ user: userOid });
  }

  /**
   * Look up an invitation-typed notification owned by the user and return
   * its referenced invitationId. The teams service uses this to drive
   * in-app accept/decline flows from a notification id.
   */
  async resolveInvitationNotification(
    userId: string,
    notificationId: string,
  ): Promise<{ notification: NotificationDocument; invitationId: string }> {
    const userOid = toObjectId(userId);
    const notifOid = toObjectId(notificationId);
    if (!userOid || !notifOid) {
      throw new NotFoundException('Notification introuvable');
    }
    const notif = await this.notificationModel.findOne({
      _id: notifOid,
      user: userOid,
    });
    if (!notif) throw new NotFoundException('Notification introuvable');
    if (notif.type !== NotificationType.INVITATION_RECEIVED) {
      throw new BadRequestException(
        "Cette notification ne supporte pas cette action",
      );
    }
    const invitationId = String((notif.data ?? {}).invitationId ?? '');
    if (!invitationId) {
      throw new BadRequestException('Invitation référencée introuvable');
    }
    return { notification: notif, invitationId };
  }
}
