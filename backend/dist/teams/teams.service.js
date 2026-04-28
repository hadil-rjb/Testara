"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const crypto = __importStar(require("crypto"));
const team_schema_1 = require("./schemas/team.schema");
const invitation_schema_1 = require("./schemas/invitation.schema");
const user_schema_1 = require("../users/schemas/user.schema");
const project_schema_1 = require("../projects/schemas/project.schema");
const mail_service_1 = require("../mail/mail.service");
const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
function toObjectId(id) {
    if (!id)
        return null;
    if (id instanceof mongoose_2.Types.ObjectId)
        return id;
    const s = String(id);
    return mongoose_2.Types.ObjectId.isValid(s) ? new mongoose_2.Types.ObjectId(s) : null;
}
let TeamsService = class TeamsService {
    constructor(teamModel, userModel, projectModel, invitationModel, mailService) {
        this.teamModel = teamModel;
        this.userModel = userModel;
        this.projectModel = projectModel;
        this.invitationModel = invitationModel;
        this.mailService = mailService;
    }
    async assertEnterprise(userId) {
        const user = await this.userModel.findById(userId);
        if (!user)
            throw new common_1.NotFoundException('Utilisateur non trouvé');
        if (user.accountType !== user_schema_1.AccountType.ENTERPRISE) {
            throw new common_1.ForbiddenException('Les équipes ne sont disponibles que pour les comptes entreprise');
        }
        return user;
    }
    async loadOwnedTeam(teamId, userId) {
        const team = await this.teamModel.findById(teamId);
        if (!team)
            throw new common_1.NotFoundException('Équipe non trouvée');
        if (String(team.owner) !== String(userId)) {
            throw new common_1.ForbiddenException("Vous n'êtes pas propriétaire de cette équipe");
        }
        return team;
    }
    async create(userId, dto) {
        await this.assertEnterprise(userId);
        const ownerId = toObjectId(userId);
        if (!ownerId)
            throw new common_1.BadRequestException('Identifiant utilisateur invalide');
        const team = new this.teamModel({
            name: dto.name.trim(),
            description: dto.description?.trim(),
            owner: ownerId,
            members: [],
            projects: [],
        });
        return team.save();
    }
    async findAllByOwner(userId) {
        await this.assertEnterprise(userId);
        const ownerId = toObjectId(userId);
        if (!ownerId)
            return [];
        const teamDocs = await this.teamModel
            .find({ owner: ownerId })
            .populate('members.user', 'firstName lastName email avatar')
            .populate('projects', 'name url')
            .sort({ createdAt: -1 })
            .exec();
        if (teamDocs.length === 0)
            return [];
        const teamObjectIds = teamDocs.map((t) => t._id);
        const pendingCounts = await this.invitationModel.aggregate([
            {
                $match: {
                    team: { $in: teamObjectIds },
                    status: invitation_schema_1.InvitationStatus.PENDING,
                },
            },
            { $group: { _id: '$team', count: { $sum: 1 } } },
        ]);
        const countByTeam = new Map(pendingCounts.map((p) => [String(p._id), p.count]));
        return teamDocs.map((t) => {
            const json = t.toJSON();
            return {
                ...json,
                _id: String(t._id),
                owner: String(t.owner),
                pendingInvitationCount: countByTeam.get(String(t._id)) ?? 0,
            };
        });
    }
    async findOne(teamId, userId) {
        await this.assertEnterprise(userId);
        const oid = toObjectId(teamId);
        if (!oid)
            throw new common_1.NotFoundException('Équipe non trouvée');
        const team = await this.teamModel
            .findById(oid)
            .populate('members.user', 'firstName lastName email avatar')
            .populate('projects', 'name url status environment');
        if (!team)
            throw new common_1.NotFoundException('Équipe non trouvée');
        if (String(team.owner) !== String(userId)) {
            throw new common_1.ForbiddenException("Vous n'êtes pas propriétaire de cette équipe");
        }
        return team;
    }
    async update(teamId, userId, dto) {
        await this.assertEnterprise(userId);
        const team = await this.loadOwnedTeam(teamId, userId);
        if (dto.name !== undefined)
            team.name = dto.name.trim();
        if (dto.description !== undefined)
            team.description = dto.description.trim() || undefined;
        await team.save();
        return this.findOne(teamId, userId);
    }
    async remove(teamId, userId) {
        await this.assertEnterprise(userId);
        const team = await this.loadOwnedTeam(teamId, userId);
        await this.invitationModel.deleteMany({ team: team._id });
        await team.deleteOne();
    }
    async updateMemberRole(teamId, userId, memberId, dto) {
        await this.assertEnterprise(userId);
        const team = await this.loadOwnedTeam(teamId, userId);
        const member = team.members.find((m) => String(m.user) === String(memberId));
        if (!member)
            throw new common_1.NotFoundException('Membre introuvable');
        member.role = dto.role;
        await team.save();
        return this.findOne(teamId, userId);
    }
    async removeMember(teamId, userId, memberId) {
        await this.assertEnterprise(userId);
        const team = await this.loadOwnedTeam(teamId, userId);
        const before = team.members.length;
        team.members = team.members.filter((m) => String(m.user) !== String(memberId));
        if (team.members.length === before) {
            throw new common_1.NotFoundException('Membre introuvable');
        }
        await team.save();
        return this.findOne(teamId, userId);
    }
    async inviteMember(teamId, userId, dto) {
        const owner = await this.assertEnterprise(userId);
        const team = await this.loadOwnedTeam(teamId, userId);
        const email = dto.email.trim().toLowerCase();
        if (String(owner.email).toLowerCase() === email) {
            throw new common_1.BadRequestException("Vous êtes le propriétaire — inutile de vous inviter");
        }
        const existingUser = await this.userModel.findOne({ email });
        if (existingUser &&
            team.members.some((m) => String(m.user) === String(existingUser._id))) {
            throw new common_1.BadRequestException('Cet utilisateur fait déjà partie de cette équipe');
        }
        const existingPending = await this.invitationModel.findOne({
            team: team._id,
            email,
            status: invitation_schema_1.InvitationStatus.PENDING,
        });
        if (existingPending) {
            throw new common_1.BadRequestException('Une invitation est déjà en attente pour cet e-mail');
        }
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + INVITE_TTL_MS);
        const invitation = await this.invitationModel.create({
            team: team._id,
            email,
            role: dto.role,
            token,
            invitedBy: new mongoose_2.Types.ObjectId(userId),
            expiresAt,
            status: invitation_schema_1.InvitationStatus.PENDING,
        });
        try {
            await this.mailService.sendTeamInvitationEmail(email, token, {
                teamName: team.name,
                inviterName: `${owner.firstName} ${owner.lastName}`.trim() || owner.email,
                role: dto.role,
                isExistingUser: !!existingUser,
            });
        }
        catch (err) {
            await invitation.deleteOne();
            console.error('Failed to send invitation email', err);
            throw new common_1.InternalServerErrorException('The invitation was not saved because the email could not be delivered. ' +
                'Please check your mail configuration and try again.');
        }
        return invitation;
    }
    async listInvitations(teamId, userId) {
        await this.assertEnterprise(userId);
        await this.loadOwnedTeam(teamId, userId);
        const teamOid = toObjectId(teamId);
        if (!teamOid)
            return [];
        await this.invitationModel.updateMany({
            team: teamOid,
            status: invitation_schema_1.InvitationStatus.PENDING,
            expiresAt: { $lt: new Date() },
        }, { $set: { status: invitation_schema_1.InvitationStatus.EXPIRED } });
        return this.invitationModel
            .find({ team: teamOid })
            .populate('invitedBy', 'firstName lastName email')
            .sort({ createdAt: -1 })
            .exec();
    }
    async revokeInvitation(teamId, userId, invitationId) {
        await this.assertEnterprise(userId);
        await this.loadOwnedTeam(teamId, userId);
        const teamOid = toObjectId(teamId);
        const inviteOid = toObjectId(invitationId);
        if (!teamOid || !inviteOid) {
            throw new common_1.NotFoundException('Invitation introuvable');
        }
        const invite = await this.invitationModel.findOne({
            _id: inviteOid,
            team: teamOid,
        });
        if (!invite)
            throw new common_1.NotFoundException('Invitation introuvable');
        if (invite.status !== invitation_schema_1.InvitationStatus.PENDING) {
            await invite.deleteOne();
            return;
        }
        invite.status = invitation_schema_1.InvitationStatus.REVOKED;
        await invite.save();
    }
    async resendInvitation(teamId, userId, invitationId) {
        const owner = await this.assertEnterprise(userId);
        const team = await this.loadOwnedTeam(teamId, userId);
        const teamOid = toObjectId(teamId);
        const inviteOid = toObjectId(invitationId);
        if (!teamOid || !inviteOid) {
            throw new common_1.NotFoundException('Invitation introuvable');
        }
        const invite = await this.invitationModel.findOne({
            _id: inviteOid,
            team: teamOid,
        });
        if (!invite)
            throw new common_1.NotFoundException('Invitation introuvable');
        if (invite.status !== invitation_schema_1.InvitationStatus.PENDING) {
            throw new common_1.BadRequestException("Cette invitation n'est plus en attente");
        }
        invite.token = crypto.randomBytes(32).toString('hex');
        invite.expiresAt = new Date(Date.now() + INVITE_TTL_MS);
        await invite.save();
        const existingUser = await this.userModel.findOne({ email: invite.email });
        try {
            await this.mailService.sendTeamInvitationEmail(invite.email, invite.token, {
                teamName: team.name,
                inviterName: `${owner.firstName} ${owner.lastName}`.trim() || owner.email,
                role: invite.role,
                isExistingUser: !!existingUser,
            });
        }
        catch (err) {
            console.error('Failed to resend invitation email', err);
            throw new common_1.InternalServerErrorException('The invitation token was refreshed but the email could not be delivered. ' +
                'Please check your mail configuration and try again.');
        }
        return invite;
    }
    async getInvitationByToken(token) {
        const invite = await this.invitationModel
            .findOne({ token })
            .populate('invitedBy', 'firstName lastName email')
            .populate('team', 'name');
        if (!invite)
            throw new common_1.NotFoundException('Invitation introuvable');
        let effectiveStatus = invite.status;
        if (invite.status === invitation_schema_1.InvitationStatus.PENDING &&
            invite.expiresAt.getTime() < Date.now()) {
            invite.status = invitation_schema_1.InvitationStatus.EXPIRED;
            await invite.save();
            effectiveStatus = invitation_schema_1.InvitationStatus.EXPIRED;
        }
        const teamDoc = invite.team;
        const inviterDoc = invite.invitedBy;
        const existing = await this.userModel.findOne({ email: invite.email });
        return {
            invitation: invite,
            teamName: teamDoc?.name ?? '',
            inviterName: `${inviterDoc?.firstName ?? ''} ${inviterDoc?.lastName ?? ''}`.trim() ||
                inviterDoc?.email ||
                '',
            hasAccount: !!existing,
            effectiveStatus,
        };
    }
    async acceptInvitation(token, userId) {
        const invite = await this.invitationModel.findOne({ token });
        if (!invite)
            throw new common_1.NotFoundException('Invitation introuvable');
        if (invite.status === invitation_schema_1.InvitationStatus.ACCEPTED) {
            throw new common_1.BadRequestException('Cette invitation a déjà été acceptée');
        }
        if (invite.status === invitation_schema_1.InvitationStatus.REVOKED) {
            throw new common_1.BadRequestException('Cette invitation a été révoquée');
        }
        if (invite.status === invitation_schema_1.InvitationStatus.EXPIRED ||
            invite.expiresAt.getTime() < Date.now()) {
            invite.status = invitation_schema_1.InvitationStatus.EXPIRED;
            await invite.save();
            throw new common_1.BadRequestException('Cette invitation a expiré');
        }
        const user = await this.userModel.findById(userId);
        if (!user)
            throw new common_1.NotFoundException('Utilisateur non trouvé');
        if (String(user.email).toLowerCase() !== String(invite.email).toLowerCase()) {
            throw new common_1.ForbiddenException("Cette invitation a été envoyée à une autre adresse e-mail");
        }
        const team = await this.teamModel.findById(invite.team);
        if (!team) {
            throw new common_1.NotFoundException("L'équipe associée à cette invitation n'existe plus");
        }
        if (!team.members.some((m) => String(m.user) === String(user._id))) {
            team.members.push({
                user: user._id,
                role: invite.role,
            });
            await team.save();
        }
        invite.status = invitation_schema_1.InvitationStatus.ACCEPTED;
        invite.acceptedAt = new Date();
        invite.acceptedBy = user._id;
        await invite.save();
        return team;
    }
    async setProjectAccess(teamId, userId, dto) {
        await this.assertEnterprise(userId);
        const team = await this.loadOwnedTeam(teamId, userId);
        const ownerId = toObjectId(userId);
        if (!ownerId) {
            throw new common_1.BadRequestException('Identifiant utilisateur invalide');
        }
        const requestedProjectIds = dto.projectIds
            .map((id) => toObjectId(id))
            .filter((id) => id !== null);
        const owned = await this.projectModel
            .find({ _id: { $in: requestedProjectIds }, owner: ownerId })
            .select('_id');
        team.projects = owned.map((p) => p._id);
        await team.save();
        return this.findOne(teamId, userId);
    }
    getRoleFor(team, userId) {
        const m = team.members.find((x) => String(x.user) === String(userId));
        return m ? m.role : null;
    }
};
exports.TeamsService = TeamsService;
exports.TeamsService = TeamsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(team_schema_1.Team.name)),
    __param(1, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(2, (0, mongoose_1.InjectModel)(project_schema_1.Project.name)),
    __param(3, (0, mongoose_1.InjectModel)(invitation_schema_1.Invitation.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mail_service_1.MailService])
], TeamsService);
//# sourceMappingURL=teams.service.js.map