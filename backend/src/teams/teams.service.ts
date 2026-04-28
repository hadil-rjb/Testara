import {
  BadRequestException,
  forwardRef,
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as crypto from 'crypto';
import { Team, TeamDocument, TeamRole } from './schemas/team.schema';
import {
  Invitation,
  InvitationDocument,
  InvitationStatus,
} from './schemas/invitation.schema';
import {
  CreateTeamDto,
  InviteMemberDto,
  SetProjectAccessDto,
  UpdateMemberRoleDto,
  UpdateTeamDto,
} from './dto/team.dto';
import { User, UserDocument, AccountType } from '../users/schemas/user.schema';
import { Project, ProjectDocument } from '../projects/schemas/project.schema';
import { MailService } from '../mail/mail.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/schemas/notification.schema';

/** How long an invitation token remains valid. */
const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Safely coerce a value to Types.ObjectId. Accepts an ObjectId,
 * a 24-char hex string, or a plain stringy id. Returns null if invalid.
 */
function toObjectId(id: unknown): Types.ObjectId | null {
  if (!id) return null;
  if (id instanceof Types.ObjectId) return id;
  const s = String(id);
  return Types.ObjectId.isValid(s) ? new Types.ObjectId(s) : null;
}

@Injectable()
export class TeamsService {
  constructor(
    @InjectModel(Team.name) private readonly teamModel: Model<TeamDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Project.name)
    private readonly projectModel: Model<ProjectDocument>,
    @InjectModel(Invitation.name)
    private readonly invitationModel: Model<InvitationDocument>,
    private readonly mailService: MailService,
    @Inject(forwardRef(() => NotificationsService))
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Best-effort notify helper. We never let a notification persistence
   * failure bubble up and abort a team operation, so callers wrap with
   * this and we just log on failure.
   */
  private async safeNotify(
    fn: () => Promise<unknown>,
    context: string,
  ): Promise<void> {
    try {
      await fn();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(`[notify] ${context} failed`, err);
    }
  }

  private formatUserName(user: {
    firstName?: string;
    lastName?: string;
    email?: string;
  }): string {
    const name = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
    return name || user.email || '';
  }

  /** Ensures the caller has an enterprise account — teams are enterprise-only. */
  private async assertEnterprise(userId: string): Promise<UserDocument> {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('Utilisateur non trouvé');
    if (user.accountType !== AccountType.ENTERPRISE) {
      throw new ForbiddenException(
        'Les équipes ne sont disponibles que pour les comptes entreprise',
      );
    }
    return user;
  }

  private async loadOwnedTeam(
    teamId: string,
    userId: string,
  ): Promise<TeamDocument> {
    const team = await this.teamModel.findById(teamId);
    if (!team) throw new NotFoundException('Équipe non trouvée');
    if (String(team.owner) !== String(userId)) {
      throw new ForbiddenException("Vous n'êtes pas propriétaire de cette équipe");
    }
    return team;
  }

  async create(userId: string, dto: CreateTeamDto): Promise<TeamDocument> {
    await this.assertEnterprise(userId);
    const ownerId = toObjectId(userId);
    if (!ownerId) throw new BadRequestException('Identifiant utilisateur invalide');
    const team = new this.teamModel({
      name: dto.name.trim(),
      description: dto.description?.trim(),
      owner: ownerId,
      members: [],
      projects: [],
    });
    return team.save();
  }

  /**
   * Returns every team owned by the user. Each item is a plain JSON object
   * with string `_id` / `owner` and an annotated `pendingInvitationCount`.
   *
   * IMPORTANT: We explicitly cast `userId` to ObjectId for the query — some
   * Mongoose setups don't auto-cast strings reliably on populated queries
   * combined with `.lean()`, which can silently produce an empty result set.
   */
  async findAllByOwner(userId: string): Promise<Record<string, unknown>[]> {
    await this.assertEnterprise(userId);
    const ownerId = toObjectId(userId);
    if (!ownerId) return [];

    // Get as Mongoose docs so populate works reliably, then explicitly
    // serialize with toJSON() which applies the schema transform and turns
    // ObjectIds into strings.
    const teamDocs = await this.teamModel
      .find({ owner: ownerId })
      .populate('members.user', 'firstName lastName email avatar')
      .populate('projects', 'name url')
      .sort({ createdAt: -1 })
      .exec();

    if (teamDocs.length === 0) return [];

    const teamObjectIds = teamDocs.map((t) => t._id);
    const pendingCounts = await this.invitationModel.aggregate<{
      _id: Types.ObjectId;
      count: number;
    }>([
      {
        $match: {
          team: { $in: teamObjectIds },
          status: InvitationStatus.PENDING,
        },
      },
      { $group: { _id: '$team', count: { $sum: 1 } } },
    ]);
    const countByTeam = new Map(
      pendingCounts.map((p) => [String(p._id), p.count]),
    );

    return teamDocs.map((t) => {
      // toJSON applies the schema's transform (if any) and gives us a
      // clean POJO with string-serialisable ObjectIds.
      const json = t.toJSON() as Record<string, unknown>;
      return {
        ...json,
        _id: String(t._id),
        owner: String(t.owner),
        pendingInvitationCount: countByTeam.get(String(t._id)) ?? 0,
      };
    });
  }

  async findOne(teamId: string, userId: string): Promise<TeamDocument> {
    await this.assertEnterprise(userId);
    const oid = toObjectId(teamId);
    if (!oid) throw new NotFoundException('Équipe non trouvée');

    const team = await this.teamModel
      .findById(oid)
      .populate('members.user', 'firstName lastName email avatar')
      .populate('projects', 'name url status environment');
    if (!team) throw new NotFoundException('Équipe non trouvée');
    if (String(team.owner) !== String(userId)) {
      throw new ForbiddenException("Vous n'êtes pas propriétaire de cette équipe");
    }
    return team;
  }

  async update(
    teamId: string,
    userId: string,
    dto: UpdateTeamDto,
  ): Promise<TeamDocument> {
    await this.assertEnterprise(userId);
    const team = await this.loadOwnedTeam(teamId, userId);
    if (dto.name !== undefined) team.name = dto.name.trim();
    if (dto.description !== undefined)
      team.description = dto.description.trim() || undefined;
    await team.save();
    return this.findOne(teamId, userId);
  }

  async remove(teamId: string, userId: string): Promise<void> {
    await this.assertEnterprise(userId);
    const team = await this.loadOwnedTeam(teamId, userId);

    // Snapshot before deletion so we can notify everyone affected.
    const memberIds = team.members
      .map((m) => String(m.user))
      .filter((id) => id !== String(team.owner));
    const teamName = team.name;
    const teamIdStr = String(team._id);

    // Deactivate any pending invitation notifications referencing
    // invitations that are about to be deleted.
    const pendingInvites = await this.invitationModel
      .find({ team: team._id })
      .select('_id');
    for (const inv of pendingInvites) {
      await this.notificationsService.deactivateForInvitation(
        inv._id as Types.ObjectId,
      );
    }

    await this.invitationModel.deleteMany({ team: team._id });
    await team.deleteOne();

    if (memberIds.length > 0) {
      const payloads = memberIds
        .map((id) => toObjectId(id))
        .filter((id): id is Types.ObjectId => id !== null)
        .map((uid) => ({
          user: uid,
          type: NotificationType.TEAM_DELETED,
          title: `Team ${teamName} was deleted`,
          message:
            'You no longer have access to projects shared through that team.',
          data: { teamId: teamIdStr, teamName },
        }));
      await this.safeNotify(
        () => this.notificationsService.createMany(payloads),
        'team_deleted',
      );
    }
  }

  // ──────────────────── Members (post-acceptance) ────────────────────

  async updateMemberRole(
    teamId: string,
    userId: string,
    memberId: string,
    dto: UpdateMemberRoleDto,
  ): Promise<TeamDocument> {
    await this.assertEnterprise(userId);
    const team = await this.loadOwnedTeam(teamId, userId);
    const member = team.members.find((m) => String(m.user) === String(memberId));
    if (!member) throw new NotFoundException('Membre introuvable');
    const previousRole = member.role;
    member.role = dto.role;
    await team.save();

    if (previousRole !== dto.role) {
      const memberOid = toObjectId(memberId);
      if (memberOid) {
        await this.safeNotify(
          () =>
            this.notificationsService.create({
              user: memberOid,
              type: NotificationType.TEAM_ROLE_CHANGED,
              title: `Your role in ${team.name} changed`,
              message: `You're now a ${dto.role} (was ${previousRole}).`,
              data: {
                teamId: String(team._id),
                teamName: team.name,
                role: dto.role,
                previousRole,
              },
            }),
          'team_role_changed',
        );
      }
    }

    return this.findOne(teamId, userId);
  }

  async removeMember(
    teamId: string,
    userId: string,
    memberId: string,
  ): Promise<TeamDocument> {
    await this.assertEnterprise(userId);
    const team = await this.loadOwnedTeam(teamId, userId);
    const before = team.members.length;
    team.members = team.members.filter(
      (m) => String(m.user) !== String(memberId),
    );
    if (team.members.length === before) {
      throw new NotFoundException('Membre introuvable');
    }
    await team.save();

    const memberOid = toObjectId(memberId);
    if (memberOid) {
      await this.safeNotify(
        () =>
          this.notificationsService.create({
            user: memberOid,
            type: NotificationType.TEAM_MEMBERSHIP_REMOVED,
            title: `You were removed from ${team.name}`,
            message:
              'You no longer have access to projects shared through this team.',
            data: {
              teamId: String(team._id),
              teamName: team.name,
            },
          }),
        'team_membership_removed',
      );
    }

    return this.findOne(teamId, userId);
  }

  // ──────────────────── Invitations (owner-scoped) ────────────────────

  async inviteMember(
    teamId: string,
    userId: string,
    dto: InviteMemberDto,
  ): Promise<InvitationDocument> {
    const owner = await this.assertEnterprise(userId);
    const team = await this.loadOwnedTeam(teamId, userId);
    const email = dto.email.trim().toLowerCase();

    if (String(owner.email).toLowerCase() === email) {
      throw new BadRequestException(
        "Vous êtes le propriétaire — inutile de vous inviter",
      );
    }

    const existingUser = await this.userModel.findOne({ email });
    if (
      existingUser &&
      team.members.some(
        (m) => String(m.user) === String(existingUser._id),
      )
    ) {
      throw new BadRequestException(
        'Cet utilisateur fait déjà partie de cette équipe',
      );
    }

    const existingPending = await this.invitationModel.findOne({
      team: team._id,
      email,
      status: InvitationStatus.PENDING,
    });
    if (existingPending) {
      throw new BadRequestException(
        'Une invitation est déjà en attente pour cet e-mail',
      );
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + INVITE_TTL_MS);

    const invitation = await this.invitationModel.create({
      team: team._id,
      email,
      role: dto.role,
      token,
      invitedBy: new Types.ObjectId(userId),
      expiresAt,
      status: InvitationStatus.PENDING,
    });

    try {
      await this.mailService.sendTeamInvitationEmail(email, token, {
        teamName: team.name,
        inviterName:
          `${owner.firstName} ${owner.lastName}`.trim() || owner.email,
        role: dto.role,
        isExistingUser: !!existingUser,
      });
    } catch (err) {
      // Roll back the invitation so the owner can retry cleanly.
      await invitation.deleteOne();
      // eslint-disable-next-line no-console
      console.error('Failed to send invitation email', err);
      throw new InternalServerErrorException(
        'The invitation was not saved because the email could not be delivered. ' +
          'Please check your mail configuration and try again.',
      );
    }

    // If the invitee already has an account, surface the invitation in
    // their dashboard so they can accept/decline without leaving the app.
    if (existingUser) {
      const inviterName = this.formatUserName(owner);
      await this.safeNotify(
        () =>
          this.notificationsService.create({
            user: existingUser._id as Types.ObjectId,
            type: NotificationType.INVITATION_RECEIVED,
            title: `${inviterName} invited you to join ${team.name}`,
            message: `Role: ${dto.role}. You can accept or decline below.`,
            data: {
              invitationId: String(invitation._id),
              teamId: String(team._id),
              teamName: team.name,
              role: dto.role,
              inviterId: String(owner._id),
              inviterName,
            },
            actionable: true,
          }),
        'invitation_received',
      );
    }

    return invitation;
  }

  async listInvitations(
    teamId: string,
    userId: string,
  ): Promise<InvitationDocument[]> {
    await this.assertEnterprise(userId);
    await this.loadOwnedTeam(teamId, userId);
    const teamOid = toObjectId(teamId);
    if (!teamOid) return [];

    // Auto-expire any pending invitations whose expiresAt has passed.
    // This keeps the UI honest: the owner sees the real status.
    await this.invitationModel.updateMany(
      {
        team: teamOid,
        status: InvitationStatus.PENDING,
        expiresAt: { $lt: new Date() },
      },
      { $set: { status: InvitationStatus.EXPIRED } },
    );

    return this.invitationModel
      .find({ team: teamOid })
      .populate('invitedBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async revokeInvitation(
    teamId: string,
    userId: string,
    invitationId: string,
  ): Promise<void> {
    await this.assertEnterprise(userId);
    await this.loadOwnedTeam(teamId, userId);
    const teamOid = toObjectId(teamId);
    const inviteOid = toObjectId(invitationId);
    if (!teamOid || !inviteOid) {
      throw new NotFoundException('Invitation introuvable');
    }
    const invite = await this.invitationModel.findOne({
      _id: inviteOid,
      team: teamOid,
    });
    if (!invite) throw new NotFoundException('Invitation introuvable');
    if (invite.status !== InvitationStatus.PENDING) {
      await invite.deleteOne();
      await this.notificationsService.deactivateForInvitation(
        invite._id as Types.ObjectId,
      );
      return;
    }
    invite.status = InvitationStatus.REVOKED;
    await invite.save();
    // The QA manager just revoked the invitation; if the invitee already
    // had an in-app notification, hide its action buttons.
    await this.notificationsService.deactivateForInvitation(
      invite._id as Types.ObjectId,
    );
  }

  async resendInvitation(
    teamId: string,
    userId: string,
    invitationId: string,
  ): Promise<InvitationDocument> {
    const owner = await this.assertEnterprise(userId);
    const team = await this.loadOwnedTeam(teamId, userId);
    const teamOid = toObjectId(teamId);
    const inviteOid = toObjectId(invitationId);
    if (!teamOid || !inviteOid) {
      throw new NotFoundException('Invitation introuvable');
    }
    const invite = await this.invitationModel.findOne({
      _id: inviteOid,
      team: teamOid,
    });
    if (!invite) throw new NotFoundException('Invitation introuvable');
    if (invite.status !== InvitationStatus.PENDING) {
      throw new BadRequestException("Cette invitation n'est plus en attente");
    }
    invite.token = crypto.randomBytes(32).toString('hex');
    invite.expiresAt = new Date(Date.now() + INVITE_TTL_MS);
    await invite.save();

    const existingUser = await this.userModel.findOne({ email: invite.email });
    try {
      await this.mailService.sendTeamInvitationEmail(invite.email, invite.token, {
        teamName: team.name,
        inviterName:
          `${owner.firstName} ${owner.lastName}`.trim() || owner.email,
        role: invite.role,
        isExistingUser: !!existingUser,
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to resend invitation email', err);
      throw new InternalServerErrorException(
        'The invitation token was refreshed but the email could not be delivered. ' +
          'Please check your mail configuration and try again.',
      );
    }

    return invite;
  }

  // ──────────────────── Invitations (public, token-based) ────────────────────

  async getInvitationByToken(token: string): Promise<{
    invitation: InvitationDocument;
    teamName: string;
    inviterName: string;
    hasAccount: boolean;
    effectiveStatus: InvitationStatus;
  }> {
    const invite = await this.invitationModel
      .findOne({ token })
      .populate('invitedBy', 'firstName lastName email')
      .populate('team', 'name');
    if (!invite) throw new NotFoundException('Invitation introuvable');

    let effectiveStatus = invite.status;
    if (
      invite.status === InvitationStatus.PENDING &&
      invite.expiresAt.getTime() < Date.now()
    ) {
      invite.status = InvitationStatus.EXPIRED;
      await invite.save();
      effectiveStatus = InvitationStatus.EXPIRED;
    }

    const teamDoc = invite.team as unknown as { name?: string } | null;
    const inviterDoc = invite.invitedBy as unknown as {
      firstName?: string;
      lastName?: string;
      email?: string;
    } | null;
    const existing = await this.userModel.findOne({ email: invite.email });

    return {
      invitation: invite,
      teamName: teamDoc?.name ?? '',
      inviterName:
        `${inviterDoc?.firstName ?? ''} ${inviterDoc?.lastName ?? ''}`.trim() ||
        inviterDoc?.email ||
        '',
      hasAccount: !!existing,
      effectiveStatus,
    };
  }

  async acceptInvitation(
    token: string,
    userId: string,
  ): Promise<TeamDocument> {
    const invite = await this.invitationModel.findOne({ token });
    if (!invite) throw new NotFoundException('Invitation introuvable');
    return this.acceptInvitationDoc(invite, userId);
  }

  /**
   * In-app accept driven by invitation id (instead of token). Used by
   * the notifications controller when the user clicks "Accept" inside
   * their dashboard panel.
   */
  async acceptInvitationById(
    invitationId: string,
    userId: string,
  ): Promise<TeamDocument> {
    const invOid = toObjectId(invitationId);
    if (!invOid) throw new NotFoundException('Invitation introuvable');
    const invite = await this.invitationModel.findById(invOid);
    if (!invite) throw new NotFoundException('Invitation introuvable');
    return this.acceptInvitationDoc(invite, userId);
  }

  /**
   * Decline an invitation from the dashboard. We mark the invitation
   * REVOKED so the QA manager sees the resolution in the team detail
   * page, and we deactivate the originating notification's action
   * buttons (handled by the caller via NotificationsService).
   */
  async declineInvitationById(
    invitationId: string,
    userId: string,
  ): Promise<void> {
    const invOid = toObjectId(invitationId);
    if (!invOid) throw new NotFoundException('Invitation introuvable');
    const invite = await this.invitationModel.findById(invOid);
    if (!invite) throw new NotFoundException('Invitation introuvable');

    if (invite.status === InvitationStatus.ACCEPTED) {
      throw new BadRequestException('Cette invitation a déjà été acceptée');
    }
    if (invite.status === InvitationStatus.REVOKED) {
      // Already resolved — make the call idempotent.
      await this.notificationsService.deactivateForInvitation(invite._id as Types.ObjectId);
      return;
    }

    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('Utilisateur non trouvé');

    if (String(user.email).toLowerCase() !== String(invite.email).toLowerCase()) {
      throw new ForbiddenException(
        "Cette invitation a été envoyée à une autre adresse e-mail",
      );
    }

    invite.status = InvitationStatus.REVOKED;
    await invite.save();

    // Tell the QA manager and clear stale action buttons in the dashboard.
    const team = await this.teamModel.findById(invite.team).select('name owner');
    await this.notificationsService.deactivateForInvitation(invite._id as Types.ObjectId);
    if (team) {
      const declinerName = this.formatUserName(user);
      await this.safeNotify(
        () =>
          this.notificationsService.create({
            user: team.owner,
            type: NotificationType.INVITATION_DECLINED,
            title: `${declinerName} declined your invitation`,
            message: `They turned down joining ${team.name}.`,
            data: {
              invitationId: String(invite._id),
              teamId: String(team._id),
              teamName: team.name,
              userId: String(user._id),
              userName: declinerName,
              userEmail: user.email,
              role: invite.role,
            },
          }),
        'invitation_declined',
      );
    }
  }

  /** Shared core for both token-based and id-based accept flows. */
  private async acceptInvitationDoc(
    invite: InvitationDocument,
    userId: string,
  ): Promise<TeamDocument> {
    if (invite.status === InvitationStatus.ACCEPTED) {
      throw new BadRequestException('Cette invitation a déjà été acceptée');
    }
    if (invite.status === InvitationStatus.REVOKED) {
      throw new BadRequestException('Cette invitation a été révoquée');
    }
    if (
      invite.status === InvitationStatus.EXPIRED ||
      invite.expiresAt.getTime() < Date.now()
    ) {
      invite.status = InvitationStatus.EXPIRED;
      await invite.save();
      throw new BadRequestException('Cette invitation a expiré');
    }

    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('Utilisateur non trouvé');

    if (String(user.email).toLowerCase() !== String(invite.email).toLowerCase()) {
      throw new ForbiddenException(
        "Cette invitation a été envoyée à une autre adresse e-mail",
      );
    }

    const team = await this.teamModel.findById(invite.team);
    if (!team) {
      throw new NotFoundException(
        "L'équipe associée à cette invitation n'existe plus",
      );
    }

    if (!team.members.some((m) => String(m.user) === String(user._id))) {
      team.members.push({
        user: user._id as Types.ObjectId,
        role: invite.role,
      });
      await team.save();
    }

    invite.status = InvitationStatus.ACCEPTED;
    invite.acceptedAt = new Date();
    invite.acceptedBy = user._id as Types.ObjectId;
    await invite.save();

    // Clear the action buttons from the invitee's "you've been invited"
    // notification — it's resolved now.
    await this.notificationsService.deactivateForInvitation(invite._id as Types.ObjectId);

    // Notify the QA manager that the invitation was accepted.
    const accepterName = this.formatUserName(user);
    await this.safeNotify(
      () =>
        this.notificationsService.create({
          user: team.owner,
          type: NotificationType.INVITATION_ACCEPTED,
          title: `${accepterName} joined ${team.name}`,
          message: `They accepted your invitation as ${invite.role}.`,
          data: {
            invitationId: String(invite._id),
            teamId: String(team._id),
            teamName: team.name,
            userId: String(user._id),
            userName: accepterName,
            userEmail: user.email,
            role: invite.role,
          },
        }),
      'invitation_accepted',
    );

    // If this team already shares projects with its members, the new member
    // just gained access to all of them — let them know.
    if (team.projects.length > 0) {
      const projects = await this.projectModel
        .find({ _id: { $in: team.projects } })
        .select('name');
      const payloads = projects.map((p) => ({
        user: user._id as Types.ObjectId,
        type: NotificationType.PROJECT_ACCESS_GRANTED,
        title: `You now have access to ${p.name}`,
        message: `Granted via team ${team.name} (${invite.role}).`,
        data: {
          projectId: String(p._id),
          projectName: p.name,
          teamId: String(team._id),
          teamName: team.name,
          role: invite.role,
        },
      }));
      await this.safeNotify(
        () => this.notificationsService.createMany(payloads),
        'project_access_granted (on accept)',
      );
    }

    return team;
  }

  // ──────────────────── Project access ────────────────────

  async setProjectAccess(
    teamId: string,
    userId: string,
    dto: SetProjectAccessDto,
  ): Promise<TeamDocument> {
    await this.assertEnterprise(userId);
    const team = await this.loadOwnedTeam(teamId, userId);
    const ownerId = toObjectId(userId);
    if (!ownerId) {
      throw new BadRequestException('Identifiant utilisateur invalide');
    }

    const requestedProjectIds = dto.projectIds
      .map((id) => toObjectId(id))
      .filter((id): id is Types.ObjectId => id !== null);

    const owned = await this.projectModel
      .find({ _id: { $in: requestedProjectIds }, owner: ownerId })
      .select('_id name');

    const previous = new Set(team.projects.map((p) => String(p)));
    const next = new Set(owned.map((p) => String(p._id)));

    const addedIds = owned.filter((p) => !previous.has(String(p._id)));
    const removedProjectIds = [...previous].filter((id) => !next.has(id));

    team.projects = owned.map((p) => p._id as unknown as Types.ObjectId);
    await team.save();

    // Fan-out notifications to every team member (excluding the owner —
    // the owner already sees the change, they just performed it).
    const memberIds = team.members
      .map((m) => String(m.user))
      .filter((id) => id !== String(ownerId));

    if (memberIds.length > 0) {
      const memberOids = memberIds
        .map((id) => toObjectId(id))
        .filter((id): id is Types.ObjectId => id !== null);

      // Granted notifications — one per member per newly added project.
      if (addedIds.length > 0) {
        const grantPayloads = memberOids.flatMap((uid) =>
          addedIds.map((p) => {
            const memberRole = team.members.find(
              (m) => String(m.user) === String(uid),
            )?.role;
            return {
              user: uid,
              type: NotificationType.PROJECT_ACCESS_GRANTED,
              title: `You now have access to ${p.name}`,
              message: `Granted via team ${team.name}${
                memberRole ? ` (${memberRole})` : ''
              }.`,
              data: {
                projectId: String(p._id),
                projectName: p.name,
                teamId: String(team._id),
                teamName: team.name,
                role: memberRole,
              },
            };
          }),
        );
        await this.safeNotify(
          () => this.notificationsService.createMany(grantPayloads),
          'project_access_granted',
        );
      }

      // Revoked notifications — fetch project names so the message is
      // human-readable.
      if (removedProjectIds.length > 0) {
        const removedOids = removedProjectIds
          .map((id) => toObjectId(id))
          .filter((id): id is Types.ObjectId => id !== null);
        const removedDocs = await this.projectModel
          .find({ _id: { $in: removedOids } })
          .select('_id name');
        const revokePayloads = memberOids.flatMap((uid) =>
          removedDocs.map((p) => ({
            user: uid,
            type: NotificationType.PROJECT_ACCESS_REVOKED,
            title: `Access removed from ${p.name}`,
            message: `Your team ${team.name} no longer has access to this project.`,
            data: {
              projectId: String(p._id),
              projectName: p.name,
              teamId: String(team._id),
              teamName: team.name,
            },
          })),
        );
        await this.safeNotify(
          () => this.notificationsService.createMany(revokePayloads),
          'project_access_revoked',
        );
      }
    }

    return this.findOne(teamId, userId);
  }

  /** Helper used by other domains if needed. */
  getRoleFor(team: TeamDocument, userId: string): TeamRole | null {
    const m = team.members.find((x) => String(x.user) === String(userId));
    return m ? m.role : null;
  }
}
